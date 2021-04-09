# Demo Tanzu Build Service (AKS Cluster)
PURPOSE: Setup a repo that is has a quick, repeatable process to demo TBS. This example uses AKS for the cluster.

This blog references a good walk through of TBS: 
https://tanzu.vmware.com/content/blog/getting-started-with-vmware-tanzu-build-service-1-0

## Setup for the Install
1. Let's steup some variables for reuse: 
`export DH_USERNAME=<your-docker-hub-username>`
`export GH_USERNAME=<your-github-username>`
`export LOCAL_USER=$(id -un)`
1. Download the [Tanzu Service bundle](https://network.pivotal.io/products/tbs-dependencies/)
1. Untar the folder `tar xvf build-service-1.0.1.tar`
1. Create a credentials file
```
$ echo "name: build-service-credentials
credentials:
- name: kube_config
  source:
    path: \"/Users/$LOCAL_USER/.kube/config\"
  destination:
    path: \"/root/.kube/config\"" > credentials.yml
```
1. login to docker `docker login -u $DH_USERNAME`
1. login to pivotal.io `docker login registry.pivotal.io`
1. Then use kbld to push the bundle to the repo. `kbld relocate -f images.lock --lock-output images-relocated.lock --repository $DH_USERNAME/tanzu-build-service`
1. Create a secret in in the namespace you want to push your app to for dockerhub or the repo you're using: `kp secret create my-dockerhub-creds --dockerhub $DH_USERNAME -n dev`

## Install Tanzu Build Service 
```
ytt -f values.yaml \
    -f manifests \
    -v docker_repository=$DH_USERNAME \
    -v docker_username="$DH_USERNAME" \
    -v docker_password="*****" \
    | kbld -f images-relocated.lock -f- \
    | kapp deploy -a tanzu-build-service -f- -y
```

## Import dependencies
```
kp import -f descriptor-7.yaml
kp clusterstack list
```

## Build and deploy an app
* [Scaffold and run a dotnet app](https://github.com/wesreisz/demos/blob/master/dotnet-build_and_run_scaffolded_app.md)

## Deploy the app
1. Create the deployment: `kubectl create deployment jungle --image=wesreisz/thejungle:latest`
1. Expose the app/create the svc: `kubectl expose deployment jungle --type=LoadBalancer --port=8080`

## Misc Commands
1. Get the list of images in the namespace: `kp image list -n dev`
1. Get the build in the namespace: `kp build list -n dev`
1. Get the logs for an app: `kp build logs mydemo-app1 -n dev`

## Make an Update
1. Make an update on a branch
2. Do a PR
3. Deploy the change by updating image: `kubectl edit deployment jungle`