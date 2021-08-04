# Scaffold a dotnet app and run it

## Check/Change your version
1. Check your version `dotnet --version`
1. Change your version `dotnet --list-sdks`
1. Create a global.json file with:
```
{
  "sdk": {
    "version": "2.1.103"
  }
}
```
1. Now typing `dotnet version` matches what you have in that file.

## Scaffold an app
1. Create a new dir
1. Scaffold an app `dotnet new mvc` 

*NOTE: This will use whatever version `dotnet --version` gives you.

1. Run the app `dotnet run`
1. push it to github
1. Create an image:  
example on docker hub
`kp image create sample-dotnet-app --tag wesreisz/sampleapp-dotnet --namespace dev --cluster-builder default --git https://github.com/wesreisz/sample-app.git --git-revision master --wait`

example on harbor:
kp image create sample-dotnet-app --tag harbor.tools.pez.aws.grogscave.net/e2e-workshop-w02-s460/sampleapp-dotnet --cluster-builder demo-cluster-builder --git https://github.com/wesreisz/sample-app.git --git-revision master --wait

