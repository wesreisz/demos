
## Create an AKS cluster using the cli
1. Sign in to Azure cli: `az login` (`az upgrade` will install the latest).
1. Create a resource group: `az group create --name tanzu-build-service --location eastus`
1. Verify Microsoft.OperationsManagement and Microsoft.OperationalInsights are registered on your subscription. To check the registration status: `az provider show -n Microsoft.OperationsManagement -o table` & `az provider show -n Microsoft.OperationalInsights -o table`
1. Create an AKS cluster: `az aks create --resource-group tanzu-build-service --name tanzu-build-service-cluster --node-count 2 --enable-addons monitoring`
1. Get your credentials: `az aks get-credentials --resource-group tanzu-build-service --name tanzu-build-service-cluster`
1. Validate you can connect: `kubectl get nodes`