# Demo Tanzu Build Service (AKS Cluster)
PURPOSE: Setup a repo that is has a quick, repeatable process to demo TBS. This example uses AKS for the cluster.

This blog references a good walk through of TBS: 
https://tanzu.vmware.com/content/blog/getting-started-with-vmware-tanzu-build-service-1-0


## Create an AKS cluster using the cli
1. Sign in to Azure cli: `az login` (`az upgrade` will install the latest).
1. Create a resource group: `az group create --name tanzu-build-service --location eastus`
1. Verify Microsoft.OperationsManagement and Microsoft.OperationalInsights are registered on your subscription. To check the registration status: `az provider show -n Microsoft.OperationsManagement -o table` & `az provider show -n Microsoft.OperationalInsights -o table`
1. Create an AKS cluster: `az aks create --resource-group tanzu-build-service --name tanzu-build-service-cluster --node-count 2 --enable-addons monitoring`
1. Get your credentials: `az aks get-credentials --resource-group tanzu-build-service --name tanzu-build-service-cluster`
1. Validate you can connect: `kubectl get nodes`

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

## Build and deploy an MVC dotnet app
1. Scaffold an app `dotnet new mvc`
1. Run the app `dotnet run`
1. push it to github
1. Create an image:  `kp image create sample-dotnet-app --tag wesreisz/sampleapp-dotnet --namespace dev --cluster-builder default --git https://github.com/wesreisz/sample-app.git --git-revision master --wait`


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