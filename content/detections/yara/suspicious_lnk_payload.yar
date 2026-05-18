rule Suspicious_LNK_Payload
{
    meta:
        author           = "portfoliociber"
        description      = "Detects weaponised .lnk files that execute living-off-the-land binaries with embedded scripts"
        severity         = "high"
        mitre_techniques = "T1204.002,T1059.001,T1218"
        date             = "2026-04-05"

    strings:
        $lnk_magic = { 4C 00 00 00 01 14 02 00 }
        $lolb1 = "powershell" ascii wide nocase
        $lolb2 = "mshta" ascii wide nocase
        $lolb3 = "rundll32" ascii wide nocase
        $lolb4 = "regsvr32" ascii wide nocase
        $lolb5 = "wmic" ascii wide nocase
        $obf1 = "-enc" ascii wide nocase
        $obf2 = "-w hidden" ascii wide nocase
        $obf3 = "FromBase64String" ascii wide nocase
        $obf4 = "DownloadString" ascii wide nocase
        $obf5 = "IEX(" ascii wide nocase

    condition:
        $lnk_magic at 0
        and 1 of ($lolb*)
        and 1 of ($obf*)
        and filesize < 200KB
}
