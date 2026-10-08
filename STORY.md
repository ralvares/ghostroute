# ROADSHOW — The Ghost Route

## Prologue: all the lights are green

The payment district is still awake when you arrive.

Two worker rooms hum behind the cluster's doors. Somewhere inside, a customer
finishes a purchase. The ledger accepts it. The lights stay green.

Then another signal leaves the building.

Rhea waits beneath the operator hub's cold blue monitors. She has watched the
same pattern repeat: a payment, a success, a connection nobody approved.

“If checkout had failed, someone would have called us sooner,” she says.
“Everything working is what let this hide.”

She places the incident report in your hands. One line crosses the application's
learned boundary. It is small enough to dismiss. It repeats often enough that she
has stopped sleeping.

“Find out what we're sending. And why.”

Beyond the glass, the cluster looks like any other occupied building. Doors,
corridors, workers carrying releases between rooms. The people inside know their
own part of the night. Nobody knows the whole of it.

Mira meets you at the lobby. She studies the report before giving you a pass.

“You can inspect the rooms. You cannot solve this by turning my customers off.”

In worker-01, Kai keeps returning to the image he approved. His certainty slips
when you ask about the configuration that went with it.

“I reviewed the image,” he says. “That isn't the same as reviewing what it was
told to do.”

His handover has no external telemetry destination. The running application does.

The archive door is locked. A maintenance keycard waits back at the operator hub,
easy to miss if you rush straight to the console. Behind that door, Vale keeps
the change records people forget once a release turns green.

He finds the patch. A build-bot credential. A timestamp. An endpoint added to the
Deployment environment.

“A name in a log feels like an answer,” he tells you. “Sometimes it's only the
next question.”

You return to the bastion carrying accounts that disagree in useful ways. Rhea
saw a route. Kai approved an image. Vale preserved a request. Mira knows which
connections the service needs to live. The application logs can tell you what
actually crossed the boundary.

The console waits. So does a decision.

You can stop every outbound connection with one command.

If you do, the red route vanishes. For a moment, the room seems quieter.

Then Mira runs toward you.

“What did you do? Checkout is offline!”

The Pods are still Ready. Your command succeeded. The customers cannot pay.

Now the investigation has two problems, and one of them is yours.

The way out is already in your notebook: the witness who explained the ledger,
the dependency you traced, the configuration you compared with the retained
patch. Restore what the application needs. Remove what it should never have
sent. Test both claims.

When the case closes, the district still has its lights. The unexplained route
has stopped. The preserved trail can support the next investigation.

What changes is the report beside your name: whether you protected the people
who trusted the service, or learned that obligation after breaking it.

## Opening: the quiet hour

At 02:14 UTC, the payments district is running normally. The two payment Pods are
Ready. The ledger is answering. Customers can still check out.

Rhea sees something the ordinary status lights miss. Every successful payment is
followed by a connection to an address outside the application’s learned network
baseline. The signal started immediately after a release. The handover contains
no approved external telemetry destination.

She calls an independent investigator into the district:

> “Every checkout still succeeds. But now every success is followed by a signal
> to an address outside our baseline. Nobody can explain it. Find what changed—
> before someone decides that switching everything off is the answer.”

The player arrives with an empty notebook and access to a training identity. The
city is explorable, but the worker rooms require a physical investigation pass.
The records archive has its own locked door. The bastion is at the trusted
operator hub; its terminal opens when the player walks up to that console.

## Four witnesses, four incomplete accounts

**Rhea, the analyst**, has the RHACS report. She gives the first independent clue:
`payment-api → 203.0.113.77:443`, outside the learned baseline. She refuses to call
it a compromise from that observation alone. She directs the player to Mira and
mentions a maintenance keycard in the operator hub locker.

**Mira, the platform engineer**, protects the payment service. Without Rhea’s
report she refuses entry to the worker rooms. With it, she issues a physical
investigation pass and explains where the two payment Pods and ledger run. The
pass opens the story doors; Kubernetes RBAC and SCC permissions remain separate.
She cares about what customers experience, rather than a green Pod count alone.

**Kai, the release engineer**, remembers signing off the image. He did not review
the final Deployment environment. His release note contains no approved external
telemetry destination. In worker-01 he directs the investigator toward logs and
configuration; in operations he explains why an owned image should support an
arbitrary UID. His account is useful, but it still needs corroboration.

**Vale, the archive custodian**, provides the retained API trail. The keycard
opens his room. The event records a patch by the `payments/build-bot` service
account at 02:13:40 UTC; the request body added the telemetry endpoint.

> “I can give you a trail, not a culprit.”

The record identifies an API credential. It does not prove who controlled it.
The player must correlate the retained request, current configuration and
application logs at the bastion.

## Investigation: collect, connect, return

The player can interview witnesses, inspect the payment Pod and ledger, trace
flows near the actual workload, search the locker and read the archive’s release
record. Each discovered lead enters the journal. Interview panels let the player
add useful details to the notebook. Personal notes stay editable and appear
beside the terminal when the player returns to the bastion.

The terminal has no Logs or Config shortcut tabs. The player uses `oc logs`,
`oc get ... -o yaml`, NetworkPolicy inspection and jq audit filtering against the
same simulation. Story records are also available as files under `case/`.

The evidence converges on an unexpected Deployment environment value. The
application’s logs show what the exporter actually sends. The API record shows
how that setting entered the configuration. The missing egress boundary explains
why it could reach the outside address.

## The choice that changes the room

The investigator can remove the exporter and permit only necessary network
paths. This preserves checkout and earns the strongest incident rating when
all evidence and verification are collected.

The player can also apply default-deny first. The unapproved route stops. DNS and
ledger stop with it. Both payment Pods remain Ready while checkout becomes
unavailable.

The bastion panel closes. A persistent **CHECKOUT DEGRADED** flag appears. Mira
runs across the operator room to confront the investigator:

> “What did you do? Checkout is offline! Both Pods are still Ready, but your
> default-deny cut off DNS and ledger. Stopping the signal cannot cost us the
> payment service.”

This consequence leaves a service disruption in the case record. Mira points the
player back to the bastion to inspect the targeted policy. The health map shows
blocked dependencies, rather than inventing dead worker nodes. Restoring DNS and
ledger clears the persistent impact; external egress stays blocked.

## Closing the case

The player must verify the rollout, a successful ledger request and an expected
blocked external request. Configuration changes invalidate old rollout proof;
policy changes invalidate old connectivity proof. The case does not close on a
reassuring color alone.

The district keeps its lights. Rhea receives a supported explanation. Mira gets
working payments and a verified boundary. Kai gets a corrected configuration.
Vale retains the trail for further attribution. The ending records evidence,
commands and service disruptions; a careful investigation can earn S, while a
recovered outage leaves a lower rating.

The chapter closes the Ghost Route incident. It does not invent an identified
attacker. Continue journey now opens the remaining 26 chapters across Foundry,
Market, Records, Harbor, Build yard, Watch district and Council. This document
retains the first chapter script; CAMPAIGN.md describes the connected journey.
