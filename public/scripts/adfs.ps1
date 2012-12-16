#####################################################################
# Script: configureAdfs.ps1
# Descrption: Add and remove a relying party to ADFS with rules
######################################################################

function AddRelyingParty
(
[string]$realm = $(throw "Realm for the application is required. E.g.: http://whatever.com or urn:whatever"),
[string]$webAppEndpoint = $(throw "Endpoint where the token will be POSTed is required")
)
{

  # check if SP snapin exists in the machine
  if ( (Get-PSSnapin -Name Microsoft.Adfs.Powershell -Registered -ErrorAction SilentlyContinue) -eq $null )
  {
    Write-Error "This PowerShell script requires the Microsoft.Adfs.Powershell Snap-In. Try executing it from an ADFS server"
    exit;
  }

  # check if SP snapin is already loaded, if not load it
  if ( (Get-PSSnapin -Name Microsoft.Adfs.Powershell -ErrorAction SilentlyContinue) -eq $null )
  {
    Write-Verbose "Adding Microsoft.Adfs.Powershell Snapin"
    Add-PSSnapin Microsoft.Adfs.Powershell
  }

  # check if running as Admin
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if ($currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -eq $false) 
    {
      Write-Error "This PowerShell script requires Administrator privilieges. Try executing by doing right click -> 'Run as Administrator'"
      exit;
    }


  # remove if exists
  $rp = Get-ADFSRelyingPartyTrust -Name $realm
  if ($rp) 
  {
    Write-Verbose "Removing Relying Party Trust: $realm"
    Remove-ADFSRelyingPartyTrust -TargetName $realm
  }

  Write-Verbose "Adding Relying Party Trust: $realm"
  Write-Verbose "Add-ADFSRelyingPartyTrust -Name $realm -Identifier $realm -WSFedEndpoint $webAppEndpoint"
  Add-ADFSRelyingPartyTrust -Name $realm -Identifier $realm -WSFedEndpoint $webAppEndpoint

  # get the RP to add Transform and Authz rules.
  $rp = Get-ADFSRelyingPartyTrust -Name $realm

  # transform Rules
  Write-Verbose "Adding Claim Rules"
  Set-ADFSRelyingPartyTrust –TargetName $realm -IssuanceTransformRulesFile ..\OutputClaimRules.txt 

  # Authorization Rules
  $authRules = '=> issue(Type = "http://schemas.microsoft.com/authorization/claims/permit", Value = "true");'
  Write-Verbose "Adding Issuance Authorization Rules: $authRules"
  $rSet = New-ADFSClaimRuleSet –ClaimRule $authRules
  Set-ADFSRelyingPartyTrust –TargetName $realm –IssuanceAuthorizationRules $rSet.ClaimRulesString

  Remove-PSSnapin Microsoft.Adfs.Powershell

  Write-Host "Relying Party Trust '$realm' added succesfully."

}


function RemoveRelyingParty
(
[string]$realm = $(throw "Realm for the application is required. E.g.: http://whatever.com or urn:whatever")
)
{

  # check if ADFS snapin exists in the machine
  if ( (Get-PSSnapin -Name Microsoft.Adfs.Powershell -Registered -ErrorAction SilentlyContinue) -eq $null )
  {
    Write-Error "This PowerShell script requires the Microsoft.Adfs.Powershell Snap-In. Try executing it from an ADFS server"
    exit;
  }

  # check if ADFSP snapin is already loaded, if not load it
  if ( (Get-PSSnapin -Name Microsoft.Adfs.Powershell -ErrorAction SilentlyContinue) -eq $null )
  {
    Write-Verbose "Adding Microsoft.Adfs.Powershell Snapin"
    Add-PSSnapin Microsoft.Adfs.Powershell
  }

  # check if running as Admin
  $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  if ($currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -eq $false) 
  {
    Write-Error "This PowerShell script requires Administrator privilieges. Try executing by doing right click -> 'Run as Administrator'"
    exit;
  }


  # remove if exists
  $rp = Get-ADFSRelyingPartyTrust -Name $realm
  if ($rp) 
  {
    Write-Verbose "Removing Relying Party Trust: $realm"
    Remove-ADFSRelyingPartyTrust -TargetName $realm
    Write-Host "Relying Party Trust '$realm' removed succesfully."
  }

  Remove-PSSnapin Microsoft.Adfs.Powershell


}