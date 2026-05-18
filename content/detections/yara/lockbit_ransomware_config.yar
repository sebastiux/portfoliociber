rule LockBit_Ransomware_Config
{
    meta:
        author           = "portfoliociber"
        description      = "Heuristic detection for LockBit 3.0/4.0 ransomware binaries based on configuration strings and decryption stub"
        reference        = "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-075a"
        severity         = "critical"
        mitre_techniques = "T1486,T1490,T1083"
        date             = "2026-03-18"

    strings:
        $note1 = "Restore-My-Files.txt" ascii wide nocase
        $note2 = "LockBit Black" ascii wide nocase
        $note3 = ".lockbit" ascii wide
        $cfg1 = "encrypt_mode" ascii wide
        $cfg2 = "kill_processes" ascii wide
        $cfg3 = "delete_shadow_copies" ascii wide
        $cfg4 = "encrypt_filename" ascii wide
        $api1 = "BCryptEncrypt" ascii
        $api2 = "NetShareEnum" ascii

    condition:
        uint16(0) == 0x5A4D
        and filesize < 4MB
        and (
            1 of ($note*)
            or 2 of ($cfg*)
        )
        and all of ($api*)
}
