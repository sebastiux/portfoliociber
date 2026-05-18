rule RedLine_Stealer_Strings
{
    meta:
        author          = "portfoliociber"
        description     = "Detects RedLine Stealer based on embedded strings observed in unpacked samples"
        reference       = "https://malpedia.caad.fkie.fraunhofer.de/details/win.redline_stealer"
        severity        = "high"
        mitre_techniques = "T1555.003,T1005,T1041"
        date            = "2026-02-14"

    strings:
        $b1 = "ScanProfiles" ascii wide
        $b2 = "GetAllSteamUser" ascii wide
        $b3 = "ScanTelegram" ascii wide
        $b4 = "GetDiscordTokens" ascii wide
        $b5 = "BuildID" ascii wide
        $rl1 = "RedLine" ascii wide nocase
        $proto1 = "/sumcheck" ascii wide
        $proto2 = "IRemotePanel" ascii wide

    condition:
        uint16(0) == 0x5A4D
        and filesize < 5MB
        and (
            3 of ($b*)
            or ($rl1 and 1 of ($proto*))
        )
}
