# Network Policy
If you want to control traffic flow at the IP address or port level (OSI layer 3 or 4), then you might consider using Kubernetes NetworkPolicies for particular applications in your cluster. NetworkPolicies are an application-centric construct which allow you to specify how a pod is allowed to communicate with various network "entities" (we use the word "entity" here to avoid overloading the more common terms such as "endpoints" and "services", which have specific Kubernetes connotations) over the network.

The entities that a Pod can communicate with are identified through a combination of the following 3 identifiers:

Other pods that are allowed (exception: a pod cannot block access to itself)
Namespaces that are allowed
IP blocks (exception: traffic to and from the node where a Pod is running is always allowed, regardless of the IP address of the Pod or the node)
When defining a pod- or namespace- based NetworkPolicy, you use a selector to specify what traffic is allowed to and from the Pod(s) that match the selector.

Meanwhile, when IP based NetworkPolicies are created, we define policies based on IP blocks (CIDR ranges).

```
NOTE: One concept that confused me with NetworkPolicy at first is that egress and ingress
specifically refer to the pod egress and ingress. It's not the egress of the cluster.
```

**Example:**
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 172.17.0.0/16
        except:
        - 172.17.1.0/24
    - namespaceSelector:
        matchLabels:
          project: myproject
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 6379
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/24
    ports:
    - protocol: TCP
      port: 5978
```

### Create a deny all rule in a namespace
1. Create a Kind cluster and deploy Antrea in a few seconds…
1. Clone the antrea project and run `./ci/kind/kind-setup.sh create CLUSTER_NAME`
1. Run a websrver: `kubectl run web --image=nginx --labels app=web --expose --port 80`
1. Run an interactive shell and wget pod to pod html page WITHOUT a network policy `kubectl run --rm -i -t --image=alpine client-$RANDOM -- sh`
1. Get something from the container
`wget -qO- http://web`
1. Apply the networkpolicy and repeat test… it should be blocked


**block all**
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

**block all by label**
```
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: web-deny-all
spec:
  podSelector:
    matchLabels:
      app: web
  ingress: []
```


### Create a networkpolicy that adds additional behavor by matching on a label

1. Create a ns (policy-test-app) and apply denyall to it.
1. Deploy https://github.com/wesreisz/azure-voting-app-redis/blob/master/azure-vote-all-in-one-redis.yaml (python frontend & redis backend).
1. Validate it timed out (gateway timeout)
1. Label the frontend and backend, `kubectl label pods -n policy-test-app azure-vote-back-7dd7659996-sbb2r type=redis`
```
NAME                                                            LABELS
azure-vote-back-7dd7659996-sbb2r   app=azure-vote-back,pod-template-hash=7dd7659996,type=redis
azure-vote-front-6c98d888fc-npk8q  app=azure-vote-front,pod-template-hash=6c98d888fc,role=redis-client
```
5. Apply a networkpolicy that matched on type=redis and ALLOWED access from the redis-client
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-policy
  namespace: policy-test-app
spec:
  podSelector:
    matchLabels:
      type: redis
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: redis-client
    ports:
    - protocol: TCP
      port: 6379
```

6. Validate it didn’t timeout
