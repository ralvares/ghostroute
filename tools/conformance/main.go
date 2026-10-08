// Copyright 2017 The Kubernetes Authors.
// Copyright The OpenShift Authors.
// Licensed under the Apache License, Version 2.0 (see LICENSE).
// Printer functions below are adapted only for external API types and a deterministic clock.
// Kubernetes v1.35.2 printPod; OpenShift openshift-apiserver 77f4eab69952824801ecc4113666a5e87684c899 SCC/Route printers.
// This oracle does not import the game implementation.
package main

import (
	"encoding/json"
	"fmt"
	routeapi "github.com/openshift/api/route/v1"
	securityapi "github.com/openshift/api/security/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/duration"
	client "k8s.io/cli-runtime/pkg/printers"
	printers "k8s.io/kubernetes/pkg/printers"
	"os"
	"strconv"
	"strings"
	"time"
)

var podSuccessConditions = []metav1.TableRowCondition{{Type: metav1.RowCompleted, Status: metav1.ConditionTrue, Reason: "Succeeded", Message: "The pod has completed successfully."}}
var podFailedConditions = []metav1.TableRowCondition{{Type: metav1.RowCompleted, Status: metav1.ConditionTrue, Reason: "Failed", Message: "The pod failed."}}
var clock time.Time

func translateTimestampSince(t metav1.Time) string {
	if t.IsZero() {
		return "<unknown>"
	}
	return duration.HumanDuration(clock.Sub(t.Time))
}
func isRestartable(c *corev1.Container) bool {
	return c != nil && c.RestartPolicy != nil && *c.RestartPolicy == corev1.ContainerRestartPolicyAlways
}
func isTerminal(p corev1.PodPhase) bool { return p == corev1.PodSucceeded || p == corev1.PodFailed }
func hasPodReadyCondition(cs []corev1.PodCondition) bool {
	for _, c := range cs {
		if c.Type == corev1.PodReady {
			return c.Status == corev1.ConditionTrue
		}
	}
	return false
}
func isPodInitializedConditionTrue(s *corev1.PodStatus) bool {
	for _, c := range s.Conditions {
		if c.Type == corev1.PodInitialized && c.Status == corev1.ConditionTrue {
			return true
		}
	}
	return false
}
func main() {
	var req struct {
		Object  json.RawMessage
		Table   *metav1.Table
		Options client.PrintOptions
		Now     string
		Mode    string
	}
	if e := json.NewDecoder(os.Stdin).Decode(&req); e != nil {
		panic(e)
	}
	if req.Table != nil {
		for i := range req.Table.Rows {
			var raw map[string]interface{}
			json.Unmarshal(req.Table.Rows[i].Object.Raw, &raw)
			req.Table.Rows[i].Object.Object = &unstructured.Unstructured{Object: raw}
		}
		if e := client.NewTablePrinter(req.Options).PrintObj(req.Table, os.Stdout); e != nil {
			panic(e)
		}
		return
	}
	if req.Mode == "json" {
		var raw map[string]interface{}
		if e := json.Unmarshal(req.Object, &raw); e != nil {
			panic(e)
		}
		if e := (&client.JSONPrinter{}).PrintObj(&unstructured.Unstructured{Object: raw}, os.Stdout); e != nil {
			panic(e)
		}
		return
	}
	var tm metav1.TypeMeta
	json.Unmarshal(req.Object, &tm)
	clock, _ = time.Parse(time.RFC3339, req.Now)
	var rows []metav1.TableRow
	var e error
	switch tm.Kind {
	case "Pod":
		var obj corev1.Pod
		json.Unmarshal(req.Object, &obj)
		rows, e = printPod(&obj, printers.GenerateOptions{Wide: true})
	case "SecurityContextConstraints":
		var obj securityapi.SecurityContextConstraints
		json.Unmarshal(req.Object, &obj)
		rows, e = printSecurityContextConstraint(&obj, printers.GenerateOptions{})
	case "Route":
		var obj routeapi.Route
		json.Unmarshal(req.Object, &obj)
		rows, e = printRoute(&obj, printers.GenerateOptions{})
	default:
		panic("unknown oracle kind: " + tm.Kind)
	}
	if e != nil {
		panic(e)
	}
	if e := json.NewEncoder(os.Stdout).Encode(rows[0].Cells); e != nil {
		panic(e)
	}
}
func printPod(pod *corev1.Pod, options printers.GenerateOptions) ([]metav1.TableRow, error) {
	restarts := 0
	restartableInitContainerRestarts := 0
	totalContainers := len(pod.Spec.Containers)
	readyContainers := 0
	lastRestartDate := metav1.NewTime(time.Time{})
	lastRestartableInitContainerRestartDate := metav1.NewTime(time.Time{})

	podPhase := pod.Status.Phase
	reason := string(podPhase)
	if pod.Status.Reason != "" {
		reason = pod.Status.Reason
	}

	// If the Pod carries {type:PodScheduled, reason:SchedulingGated}, set reason to 'SchedulingGated'.
	for _, condition := range pod.Status.Conditions {
		if condition.Type == corev1.PodScheduled && condition.Reason == corev1.PodReasonSchedulingGated {
			reason = corev1.PodReasonSchedulingGated
		}
	}

	row := metav1.TableRow{
		Object: runtime.RawExtension{Object: pod},
	}

	switch pod.Status.Phase {
	case corev1.PodSucceeded:
		row.Conditions = podSuccessConditions
	case corev1.PodFailed:
		row.Conditions = podFailedConditions
	}

	initContainers := make(map[string]*corev1.Container)
	for i := range pod.Spec.InitContainers {
		initContainers[pod.Spec.InitContainers[i].Name] = &pod.Spec.InitContainers[i]
		if isRestartable(&pod.Spec.InitContainers[i]) {
			totalContainers++
		}
	}

	initializing := false
	for i := range pod.Status.InitContainerStatuses {
		container := pod.Status.InitContainerStatuses[i]
		restarts += int(container.RestartCount)
		if container.LastTerminationState.Terminated != nil {
			terminatedDate := container.LastTerminationState.Terminated.FinishedAt
			if lastRestartDate.Before(&terminatedDate) {
				lastRestartDate = terminatedDate
			}
		}
		if isRestartable(initContainers[container.Name]) {
			restartableInitContainerRestarts += int(container.RestartCount)
			if container.LastTerminationState.Terminated != nil {
				terminatedDate := container.LastTerminationState.Terminated.FinishedAt
				if lastRestartableInitContainerRestartDate.Before(&terminatedDate) {
					lastRestartableInitContainerRestartDate = terminatedDate
				}
			}
		}
		switch {
		case container.State.Terminated != nil && container.State.Terminated.ExitCode == 0:
			continue
		case isRestartable(initContainers[container.Name]) &&
			container.Started != nil && *container.Started:
			if container.Ready {
				readyContainers++
			}
			continue
		case container.State.Terminated != nil:
			// initialization is failed
			if len(container.State.Terminated.Reason) == 0 {
				if container.State.Terminated.Signal != 0 {
					reason = fmt.Sprintf("Init:Signal:%d", container.State.Terminated.Signal)
				} else {
					reason = fmt.Sprintf("Init:ExitCode:%d", container.State.Terminated.ExitCode)
				}
			} else {
				reason = "Init:" + container.State.Terminated.Reason
			}
			initializing = true
		case container.State.Waiting != nil && len(container.State.Waiting.Reason) > 0 && container.State.Waiting.Reason != "PodInitializing":
			reason = "Init:" + container.State.Waiting.Reason
			initializing = true
		default:
			reason = fmt.Sprintf("Init:%d/%d", i, len(pod.Spec.InitContainers))
			initializing = true
		}
		break
	}

	if !initializing || isPodInitializedConditionTrue(&pod.Status) {
		restarts = restartableInitContainerRestarts
		lastRestartDate = lastRestartableInitContainerRestartDate
		hasRunning := false
		errorReason := ""
		for i := len(pod.Status.ContainerStatuses) - 1; i >= 0; i-- {
			container := pod.Status.ContainerStatuses[i]

			restarts += int(container.RestartCount)
			if container.LastTerminationState.Terminated != nil {
				terminatedDate := container.LastTerminationState.Terminated.FinishedAt
				if lastRestartDate.Before(&terminatedDate) {
					lastRestartDate = terminatedDate
				}
			}
			switch {
			case container.State.Waiting != nil && container.State.Waiting.Reason != "":
				reason = container.State.Waiting.Reason
			case container.State.Terminated != nil:
				if len(container.State.Terminated.Reason) > 0 {
					reason = container.State.Terminated.Reason
				} else if container.State.Terminated.Signal != 0 {
					reason = fmt.Sprintf("Signal:%d", container.State.Terminated.Signal)
				} else {
					reason = fmt.Sprintf("ExitCode:%d", container.State.Terminated.ExitCode)
				}
				if container.State.Terminated.ExitCode != 0 {
					errorReason = reason
				}
			case container.Ready && container.State.Running != nil:
				hasRunning = true
				readyContainers++
			}
		}

		// change pod status back to "Running" if there is at least one container still reporting as "Running" status
		if reason == "Completed" {
			if hasRunning && hasPodReadyCondition(pod.Status.Conditions) {
				reason = "Running"
			} else if errorReason != "" {
				reason = errorReason
			} else if hasRunning {
				reason = "NotReady"
			}
		}
	}

	if pod.DeletionTimestamp != nil && pod.Status.Reason == "NodeLost" {
		reason = "Unknown"
	} else if pod.DeletionTimestamp != nil && !isTerminal(corev1.PodPhase(podPhase)) {
		reason = "Terminating"
	}

	restartsStr := strconv.Itoa(restarts)
	if restarts != 0 && !lastRestartDate.IsZero() {
		restartsStr = fmt.Sprintf("%d (%s ago)", restarts, translateTimestampSince(lastRestartDate))
	}

	row.Cells = append(row.Cells, pod.Name, fmt.Sprintf("%d/%d", readyContainers, totalContainers), reason, restartsStr, translateTimestampSince(pod.CreationTimestamp))
	if options.Wide {
		nodeName := pod.Spec.NodeName
		nominatedNodeName := pod.Status.NominatedNodeName
		podIP := ""
		if len(pod.Status.PodIPs) > 0 {
			podIP = pod.Status.PodIPs[0].IP
		}

		if podIP == "" {
			podIP = "<none>"
		}
		if nodeName == "" {
			nodeName = "<none>"
		}
		if nominatedNodeName == "" {
			nominatedNodeName = "<none>"
		}

		readinessGates := "<none>"
		if len(pod.Spec.ReadinessGates) > 0 {
			trueConditions := 0
			for _, readinessGate := range pod.Spec.ReadinessGates {
				conditionType := readinessGate.ConditionType
				for _, condition := range pod.Status.Conditions {
					if condition.Type == conditionType {
						if condition.Status == corev1.ConditionTrue {
							trueConditions++
						}
						break
					}
				}
			}
			readinessGates = fmt.Sprintf("%d/%d", trueConditions, len(pod.Spec.ReadinessGates))
		}
		row.Cells = append(row.Cells, podIP, nodeName, nominatedNodeName, readinessGates)
	}

	return []metav1.TableRow{row}, nil
}

func printSecurityContextConstraint(scc *securityapi.SecurityContextConstraints, _ printers.GenerateOptions) ([]metav1.TableRow, error) {
	row := metav1.TableRow{
		Object: runtime.RawExtension{Object: scc},
	}

	capabilities := []string{}
	for _, c := range scc.AllowedCapabilities {
		capabilities = append(capabilities, string(c))
	}

	priority := "<none>"
	if scc.Priority != nil {
		priority = fmt.Sprintf("%d", *scc.Priority)
	}

	volumes := []string{}
	for _, v := range scc.Volumes {
		volumes = append(volumes, string(v))
	}

	row.Cells = append(row.Cells,
		scc.Name,
		scc.AllowPrivilegedContainer,
		strings.Join(capabilities, ","),
		string(scc.SELinuxContext.Type),
		string(scc.RunAsUser.Type),
		string(scc.FSGroup.Type),
		string(scc.SupplementalGroups.Type),
		priority,
		scc.ReadOnlyRootFilesystem,
		strings.Join(volumes, ","),
	)

	return []metav1.TableRow{row}, nil
}

func printRoute(route *routeapi.Route, options printers.GenerateOptions) ([]metav1.TableRow, error) {
	row := metav1.TableRow{
		Object: runtime.RawExtension{Object: route},
	}

	tlsTerm := ""
	insecurePolicy := ""
	if route.Spec.TLS != nil {
		tlsTerm = string(route.Spec.TLS.Termination)
		insecurePolicy = string(route.Spec.TLS.InsecureEdgeTerminationPolicy)
	}

	name := route.Name

	var (
		matchedHost bool
		reason      string
		host        = route.Spec.Host

		admitted, errors = 0, 0
	)
	for _, ingress := range route.Status.Ingress {
		switch status, condition := ingressConditionStatus(&ingress, routeapi.RouteAdmitted); status {
		case corev1.ConditionTrue:
			admitted++
			if !matchedHost {
				matchedHost = ingress.Host == route.Spec.Host
				host = ingress.Host
			}
		case corev1.ConditionFalse:
			reason = condition.Reason
			errors++
		}
	}
	switch {
	case route.Status.Ingress == nil:
		// this is the legacy case, we should continue to show the host when talking to servers
		// that have not set status ingress, since we can't distinguish this condition from there
		// being no routers.
	case admitted == 0 && errors > 0:
		host = reason
	case errors > 0:
		host = fmt.Sprintf("%s ... %d rejected", host, errors)
	case admitted == 0:
		host = "Pending"
	case admitted > 1:
		host = fmt.Sprintf("%s ... %d more", host, admitted-1)
	}
	var policy string
	switch {
	case len(tlsTerm) != 0 && len(insecurePolicy) != 0:
		policy = fmt.Sprintf("%s/%s", tlsTerm, insecurePolicy)
	case len(tlsTerm) != 0:
		policy = tlsTerm
	case len(insecurePolicy) != 0:
		policy = fmt.Sprintf("default/%s", insecurePolicy)
	default:
		policy = ""
	}

	backends := append([]routeapi.RouteTargetReference{route.Spec.To}, route.Spec.AlternateBackends...)
	totalWeight := int32(0)
	for _, backend := range backends {
		if backend.Weight != nil {
			totalWeight += *backend.Weight
		}
	}
	var backendInfo []string
	for _, backend := range backends {
		switch {
		case backend.Weight == nil, len(backends) == 1 && totalWeight != 0:
			backendInfo = append(backendInfo, backend.Name)
		case totalWeight == 0:
			backendInfo = append(backendInfo, fmt.Sprintf("%s(0%%)", backend.Name))
		default:
			backendInfo = append(backendInfo, fmt.Sprintf("%s(%d%%)", backend.Name, *backend.Weight*100/totalWeight))
		}
	}

	var port string
	if route.Spec.Port != nil {
		port = route.Spec.Port.TargetPort.String()
	} else {
		port = "<all>"
	}

	row.Cells = append(row.Cells, name, host, route.Spec.Path, strings.Join(backendInfo, ","), port, policy, string(route.Spec.WildcardPolicy))

	return []metav1.TableRow{row}, nil
}

func ingressConditionStatus(ingress *routeapi.RouteIngress, t routeapi.RouteIngressConditionType) (corev1.ConditionStatus, routeapi.RouteIngressCondition) {
	for _, condition := range ingress.Conditions {
		if t != condition.Type {
			continue
		}
		return condition.Status, condition
	}
	return corev1.ConditionUnknown, routeapi.RouteIngressCondition{}
}
