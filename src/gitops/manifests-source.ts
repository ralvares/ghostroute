export const developerDeployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
  namespace: payments
spec:
  replicas: 2
  selector:
    matchLabels:
      app: payment-api
  template:
    metadata:
      labels:
        app: payment-api
    spec:
      serviceAccountName: payment-app
      containers:
        - name: payment-api
          image: registry.example.test/payments:v1.8.2
          env: []
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
            limits:
              memory: 128Mi
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: [ALL]
            seccompProfile:
              type: RuntimeDefault
`;
export const repairedDeployment = developerDeployment.replace(
  "payments:v1.8.2",
  "payments:v1.8.3",
);
