# Create a Kind cluster

Note: More info here: https://kind.sigs.k8s.io/docs/user/quick-start/

1. kind uses the kind cli... validate it's installed: `kind version`
1. You can create a one node cluster where the control plane and worker nodes are all on that single node by typing `kind create cluster`. Otherwise, create a yaml file with what you need:
```
cat <<EOF > cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
  extraPortMappings:
  - containerPort: 30299 
    hostPort: 30299 
  - containerPort: 80 
    hostPort: 80 
  - containerPort: 443 
    hostPort: 443  
EOF
```

## Deploy an app
1. Create the deployment: `kubectl create deployment jungle --image=wesreisz/thejungle:latest`
1. Expose the app/create the svc: `kubectl expose deployment jungle --port=80 --targetport=3000`

or [use a yaml file](https://github.com/wesreisz/demos/tree/master/yaml)