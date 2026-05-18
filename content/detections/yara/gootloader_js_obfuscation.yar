rule GootLoader_JS_Obfuscation
{
    meta:
        author           = "portfoliociber"
        description      = "Detects GootLoader-style JavaScript droppers using long concatenated string arrays and the trademark sleep/marker pattern"
        reference        = "https://www.mandiant.com/resources/blog/tracking-evolution-gootloader-operations"
        severity         = "high"
        mitre_techniques = "T1059.007,T1027,T1105"
        date             = "2026-03-02"

    strings:
        $js1 = "function" ascii
        $js2 = "var " ascii
        $arr1 = /\[['"][^'"]{2,12}['"](\s*,\s*['"][^'"]{2,12}['"]){15,}\]/ ascii
        $sleep1 = "WScript.Sleep" ascii nocase
        $sleep2 = ".setTimeout(" ascii nocase
        $marker1 = "gtag" ascii
        $marker2 = "encodeURIComponent" ascii

    condition:
        filesize < 2MB
        and $arr1
        and 1 of ($sleep*)
        and 1 of ($marker*)
        and #js1 > 2
        and #js2 > 5
}
