rule Generic_VBA_Downloader
{
    meta:
        author           = "portfoliociber"
        description      = "Detects Office macro documents that combine AutoOpen triggers with network download primitives"
        severity         = "medium"
        mitre_techniques = "T1059.005,T1566.001,T1105"
        date             = "2026-01-21"

    strings:
        $trig1 = "AutoOpen" ascii nocase
        $trig2 = "Document_Open" ascii nocase
        $trig3 = "Auto_Exec" ascii nocase
        $trig4 = "Workbook_Open" ascii nocase

        $net1 = "MSXML2.XMLHTTP" ascii nocase
        $net2 = "WinHttp.WinHttpRequest" ascii nocase
        $net3 = "URLDownloadToFile" ascii nocase
        $net4 = "ADODB.Stream" ascii nocase

        $exec1 = "Shell(" ascii nocase
        $exec2 = "WScript.Shell" ascii nocase
        $exec3 = "Powershell" ascii nocase
        $exec4 = "rundll32" ascii nocase

    condition:
        filesize < 6MB
        and 1 of ($trig*)
        and 1 of ($net*)
        and 1 of ($exec*)
}
