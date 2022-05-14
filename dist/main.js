"use strict";
// Emperor of the Fading Suns - Tech Tree Visualizer v0.4 by Munashe
//
// Drag and drop a TECH.DAT onto the window to load it
// Drag and drop a UNIT.DAT onto the window to display unit sprites (only works with EFS Vanilla UNIT.DAT)
// Tech box width, height, and spacing
let techBoxWidth = 150;
let techBoxHeight = 40;
let techBoxSpacingY = 15;
let techBoxSpacingX = 40;
let fontString = "18px Calibri";
// Default colors for tech categories. Random colors will be generated if you do not add custom ones to this array.
let colorsDefault = ["#2a2", "#b81", "#838", "#677"];
//let depcolor = "rgba(0, 255, 255, 0.5)"; // teal
let connectionColor = "rgba(255, 255, 0, 0.5)";
let highlightColor = "rgba(0, 255, 255, 1)";
let topHighlightColor = "rgba(0, 255, 0, 1)";
let depsHighlightColor = highlightColor;
let helpBoxColor = "#111111";
let churchDisdainColor = "#ee6";
let churchHateColor = "#f84";
let churchRepugnantColor = "#f11";
let textShadowColor = "#000";
let textPlainColor = "#fff";
let textControlColor = "#ff0";
//test
let enableSprites = true;
let assetPathUnits = "assets/icons-units-transparent/";
let assetPathStructures = "assets/icons-structures-transparent/";
let unitSprites = [];
let structureSprites = new Map();
let datPath = "DAT/";
let datUnitPath = datPath + "UNIT.DAT";
;
;
class Cell {
    tree;
    tech;
    indices;
    targetIndices;
    isHidden;
    constructor(tree, tech, indices, targetIndices, isHidden) {
        this.tree = tree;
        this.tech = tech;
        this.indices = indices;
        this.targetIndices = targetIndices;
        this.isHidden = isHidden;
    }
    targetCell() {
        return this.tree[this.targetIndices.x][this.targetIndices.y];
    }
    findTargetIndices() {
        let tree = this.tree;
        for (let y = 0; y < tree.length; ++y) {
            for (let x = 0; x < tree[y].length; ++x) {
                let cur = tree[y][x];
                //if (cur.tech === techDict.get("Freighter") && this.tech.name === "Bulk Hauler") console.log(cur.tech.name +" "+ cur.isHidden);
                if (cur.tech.requires?.includes(this.tech) && !cur.isHidden) {
                    this.targetIndices = cur.indices;
                    return;
                }
            }
        }
    }
}
;
let dataStructuresList = [
    { id: 0, name: "Palace", techId: 0, extra: "Required to collect taxes from Cities on a planet." },
    { id: 1, name: "Church", techId: 56, extra: "" },
    { id: 5, name: "Wetware", techId: 8, extra: "" },
    { id: 6, name: "Electronics", techId: 26, extra: "" },
    { id: 8, name: "Ceramsteel", techId: 37, extra: "" },
    { id: 9, name: "Bioplant", techId: 5, extra: "", filename: "Biochems" },
    { id: 11, name: "Chemicals", techId: 0, extra: "" },
    { id: 12, name: "Cyclotron", techId: 31, extra: "" },
    { id: 13, name: "Starport", techId: 36, extra: "" },
    { id: 17, name: "Shield", techId: 47, extra: "Prevents orbital bombardment inside its coverage. (Does not protect landing ships which are under fire from PTS)" },
    { id: 20, name: "Fusorium", techId: 28, extra: "" },
    { id: 22, name: "Hospital", techId: 2, extra: "Increased healing rate for all units garrisoned, and protects against the plague. (The first additional hospital increases planetary healing rate by 14%, and 20% for one more)" },
    { id: 23, name: "Lab", techId: 0, extra: "Provides research points based on your tax level. 500 Firebird upkeep." },
    { id: 25, name: "Arborium", techId: 14, extra: "" },
];
let dataStructures = new Array(200);
dataStructuresList.forEach(s => dataStructures[s.techId] = s);
let structuresBase64 = [
    { name: "Agora", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAAA5UExURQQECODg7ICAgKSkvEREXGxshCgYFDQgHEAsJFA0MIRkYJBwbKCAfAA4AFxA
    PCSEFAQ8LBRoDAAAAKT09sUAAAATdFJOU////////////////////////wCyfdwIAAAACXBIWXMA
    AA7DAAAOwwHHb6hkAAABTElEQVRIS+2SwXKDMBBDlyQE2wsx8P8fW2ltwIAzNIce2qmYAJH02NhE
    5o/1j3yq34ucC1eINKfGjyCNHDqXyK0BlL8kXSNyPQWVs3JmOiFyr+hRQkdE7o/bXi0saCseEMZt
    m8tUm4m3iMUttQAL8Q7JsTFZC/GsI2vcdZ2DvPer5aqIzJLioDiCqgZsb7JcFQERnhYHwaGCMz5m
    ifPb61kREg4FxES0t06yHJEBsnYxJbzkFRiHEPreEDULgH8ROUzhELS57IFtbHEc1SwBsc7YISoe
    GAkMCXIbpzFbO+KMcCH4UT23AGdae6JEUo6FBCK8elrqSMRYRXq8CSDK3cK9AqHnhmGC6ggKEWHE
    0nmZolkE4kZsiPBJVCRhJJhkTQhrCAs44sS/MMvJSCe8+K2Zr5hiGftJeDgB4fiSKO/qsqDslbff
    1d9B5vkLWK11PMGNqP4AAAAASUVORK5CYII=` },
    { name: "Arborium", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACIUlEQVR42u2ZoXLCQBCGIxCVyD5C
    RR+gEllZUYGoQCAjkIiKCgSiooIHQOQBKpCICB4goqKyb3Kdn85mluXuckc2pDDHzE6SvYX5v/x7
    ucuQZdf0McZcdCSQBHKJIIPBjaFok+8VBGKGw9s6SFxsvlcQElUUW/NTVSbPF7W42HxvIFIUjsvl
    uhYXmw+F6Qzks3g/EJWPRyfl/wVIuVmbYvVqlvOXA8Ex+bOD8CfOxYLIJ45mnA2EIMqybAzuGoWr
    ljvC1xbXOqMG4rujFJPJ/ChkS8rIHrI6UMPP1UC4G1w0+hw9z89xhPBqtzFf5XY/H2Se6vkcsUHY
    YDoBoXOItQl2gSCP70kQG4SEORnEBsHHIHI8nh1FEwjy+L50xAfRCQi5AtE2wRyqDYjKHPFBQCDE
    hYSrFhD4rafRXRCEKghitcit7YQ8goTinFxwjQPCBuJaV6JBXBBc9GI62Qv63j3vJy6HwjXGAUKi
    yRmqJwgJ4lscVUBICInkd1Ze83aiespxJzhEyMtWFIgPQjrhu7Y5h5wLQn2LwkHkU4qHzQkJxZ3x
    OaH+YiUhfKJDoELaqZNXXb5i860EFymv7x8Hda1tvG07tWqtj1kePSekMzSuBRHtCCCkSNfTSYrm
    zmhDRIPYRDe1F9XzdtSGCAKhObF++xMW6gRWbVlP2w5tiEYQvhXXiK4gegPRhugFJHTL0dkc0Yz0
    t0ICSSAJJIFc1ecXFihulKavkAkAAAAASUVORK5CYII=` },
    { name: "Biochems", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAABaUExURQQECBAQGCx0VEyUcHSwjBRYQKTMsAQ8LPw8PNwUFMAQEICAgAA4AAAgGDw8
    VCgoOKQICJCQqEREXDAwQGBgeAhQBMDAwGxshBRoDNTU5IikMODQ0CSEFAAAAFaKdsQAAAAedFJO
    U///////////////////////////////////////AOwYHF4AAAAJcEhZcwAADsMAAA7DAcdvqGQA
    AAGQSURBVEhL7dTbdoIwEAXQIQFRwaRQkGjx/3+zZyZcIgm2vnb1WLGG2ZkkuqTH2/kn7yZJiDP9
    Hydxhyjj7KJ4HEDpXCmgaWSTaJgypfI811oXO2Y7CqHzA4RSasdsBhfBpkibmOQHIdzlN0Q24ol0
    KXFu0YGnyCyOkhMf+HRfEhMtx8XkLDmeqqwOGyWIFgJTXi7G2vPxI6vrei2MCYwXqigv+FytJ6t5
    IpQ1LUqh5FqW+O7Y7PyCQHwabzgFBFXmFRHRde2ErCWyjWHCok+QSSBta33M1QjpTJKsYg0LMwyD
    MXWfJNcoLEw1VCAuSaowN74A3IWETZ4W1tD819zohqsx3V223rv0wgLyheOFMfeOAep790MXujIh
    EGnR9+PuwpbMXWps23GTntILG6v54QnmlrBJEu7ubzvncMI8uxulBwEshSHBkvk+5CxkghEdgs0H
    BAbrlqoRQlqOaIMXrHKqkaxdYNCJe3C19whv4kmEXfDL6nhH2AAonniL+bcimgBFS7a1U9KjL/N3
    yOPxDStwt/IRN0AyAAAAAElFTkSuQmCC` },
    { name: "Ceramsteel", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAABFUExURQQECJyctGxshMDAwGBgeFhYcJCQqDAwQKSUfFBAKODQ0LCkjAA4ADQEAJSE
    bMC0oIw0EGAcBLRkPCSEFBRoDIiIoAAAAJShvqMAAAAXdFJOU///////////////////////////
    //8A5kDmXgAAAAlwSFlzAAAOwgAADsIBFShKgAAAAZ9JREFUSEvt0lGCgjAMBNCAoq0irBa5/1F3
    Jk01FXD1f6NCi3mdgsr8df2Tb8sT+cy7Lmmaj8yjSUDaj3JKD8Su2eFo8zflU5DxTQrrZVtb3F2X
    /b5aoNswnhw8ke54XDe+qXGEYsNskCzWzQrBoQgaPkr9vtQrwZMO8hQwQUKsjCenPfq7rvMC0y6+
    JxTB2lEUsknkcMoZ2IkBy3hDLEPO0QwFMkBKaaO2a5WMM424DJDeiu0upWRIzIZCM0AuqAXhLeBx
    4oHGMz4Y6fxJlikSBpS2RqWcGmHGaso4jAMSAhYPOGM2ZoL2n8tVkSf4EeOAFzbFIsFLCQAFDioK
    wT8lyCAVwZwEvUVUhClKxgW53W5ZXC+5uaQkAkdGJQO3VYSFODKyHMlzCKR48RdRoFvr+1QTmDSl
    aUpte29ZkxW2pVvr++nRWs4QIAZUJF6wFIwWZBYSiDtRbucVnjBw4kmYo+1layyMuMjdi4pok/Xz
    jA/amYf3KuE3eWEUj3p33FsSJxzBH2AC423YLeACrvCZ+7ZqjIn+KKW4St2AmudfLUaFU6+QUYkA
    AAAASUVORK5CYII=` },
    { name: "Chemicals", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAABsUExURQQECIiIoJyctICAgKCAfGxshGBgeMDAwDAwQDw8VFA0MEAsJJCQqJBwbCgo
    OCgYFBAYfODQ0LicnNwUFDxQoKSkvAA4ABAQGIQEBOzs+CAgLBRoDCSEFNiIHMRQEKjERGSEHERE
    XAhQBAAAAO7zFiEAAAAkdFJOU///////////////////////////////////////////////AFgs
    DQ0AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHdSURBVEhL1ZLtVsIwEESHJmmLCjWgIgVF7fu/o7Ob
    NE1rKfrTyyn5YO7ZbAq6P/MvFJA4XSLLYFWszC+cRWW+aL45PRiMnXOGPXQoHJ20A1OWc84Q6FAV
    lRj8SDkxytpOS0+qhGgHS4JR1zqPkUC2AgM117Dr9bo3iL27qnQoSzXuJ8aS8kAFuF8Dm+12MJaU
    ogSk342wVWg0NxS7UaFRi9C4pUgNa5umkZsiYtyqYsF488hHLR5rUfGqSDw+O2l+8WBUdoMihwzE
    3yPZEg/e0aGyo8Lk/ikytsYK3yWCAmOMFFCcc3kujmRUBeIY8xxG1+ua07QyUeDhq0KDvjJ4USS+
    oCS8rxCUpSoM5s2TeaVg+4eGr7IZNc9W+J2MicIqh4PEfGy6H7WXmB0UBOWV7Pc4Ho/StOdYeVHa
    to8mBaegRFQZRtO2fZFMOUelJXhT7x0XHT+4m4yk4BSriNECb+Sd6QuhgXSspOB0zhQHOROPw9cZ
    xqxIXuXkPG+TAv9R0nbfPsfcyBVGnfvU79h23bd/RdHsPO3L19fgpJmc7Mwnkk2VmSq8ZKLemTcB
    LpkDr4W7JKaErB5j8gkRNbg3qSCMdIaZoiO+zEXnasxoHRaS1YlOxwnhx8Ytuu4bdgq8Snil8jYA
    AAAASUVORK5CYII=` },
    { name: "Church", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAADOElEQVR42u2ZLXIbQRCFBQQEAgQE
    DAIEBAQMAgQMBAwMAgIMAgwMDA0MAgMCBAwNfABDAx/AMEBHMPABBAJzhFRt8qb0bb1MZn+92qqo
    pKquHu32zr5vunt2ZQ8G+/TJsuy/tgPIXoIMh6Nsl/G9gEjUer3O6oprGn8AaQpxdfU1CDs7u6wU
    l4rvCujNIKvVKtu8vASBdUDi+DrX9VZaTcR4vLwy0wVMpz2CmDJP/HL5OUDc3NwGX6c0d15aEqZV
    1ZhjRd57hGxcXHwJnsy0AXozyP39UxCmldUqx6XjXsKJB4SM4Cm3OJu9g2iMkS3/HsdLNBnRMc8s
    8HVgOgHRLiQRMn2vMgfxho9LS/7h4bl/EAlDHL3AWKZzcbwglIG4nOgpxfUCguDx+CiHoJQkzsvK
    m514rkmVUy8ZYcV4wMnTIwjEAGL1PT5+wrv43kC0kroRwlycb6/0gWA8Hoj5/CRYXE6ynZWWr9xm
    8zMXptp3EMB03HvG43U9ILpmNBpnvWQE8XjPiIQ5xPjoW27e9B4v4T6fvst6AVGquXkKBIjZ4i77
    tVwG7zAeP50eh2xoPs0LiJeWQ5UBNQahmatABIEXTBEI4nW+LCODk0GwIqBWIL7Px9tpVUb0FCe+
    DgjZAaQIqDGIVtJBJEDX67jESWwYb2GAYAfzeAfxecsykgJq1+x/yiIFohsCAoy/IHo2UiA+b+8g
    8Qp7RniOIN7HVSCpZi+D6DQj1D0POomW8TKp8w7y+Pg9B4nndfF1+qMViASUlRYgi+n7YKfHsxyE
    pzvgbL9lIFUAjUGYhGdIDCJAQARwvvgQ/PWnjwEmBpFYB/EF0jkJH50Pk2XUGkSTaNIYhO349fVH
    5iASfnm6DCDygFBaxP+Vke28qXKaXL/bHQjf49JSE0u4jNKSsQF4BtUfCHcQjHvgOwGZ3U7+AdFK
    FYGQEUorBqF8YhDNi2l+xp1mhBTLC0xepkadzAe5sVPxSi4fYrfnaWxWnUViPs8C5zp7aXQAXy1u
    zpjf7XggHNyvc/FxBupkovX2G2fFy4DfH+5jkQ7FinOODYQs7Awk9VfDOlYUHx9P3ePwH6sDyAGk
    Y5B9+PwGcDebpc5A1ksAAAAASUVORK5CYII=` },
    { name: "Cyclotron", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACTUlEQVR42u2ZoXLCQBCGIxAVFQgE
    sqKSB6hAIisRiApkJaKiEtEHQFTyAH2APgBvls5m+JmfZfcugSUlTJj555JwkPvu3927QFHc06ss
    y06rB+lBugYyGDyUnQcRiOXys2wTJhwEELPZWzmdzluDCQVhCKgtmDAQD6ItmBCQHEQnQG4B4mKQ
    uhCD6eR2HakLUbV7EAif5/N/AWnqBNripaiE49H7YyWGO3cxbQxiQVgVqho8i0BYAvL8Nare11BN
    gBqBAGI4HJeLxerIgROIfSt9RTLo9Xpd9QGEAIgAA+kQDAUBRPE0Licf86oFgOeEAMjgAbDd/h5a
    kXaGQ43dCQNhJwRCzhnGzAkCkUGjlb6AAxBDwSGAhDoiX8YQGDBgTnJif27NOIcQgBiK80YXgxCQ
    AwTPPK6r6pRLbEsMxM6EO5IFSVQnnmGeaX0dQAyD5G8dxAOw3OBrHkx4aL1+r7IgDKEHyC5oWbAI
    NSygoSAQzgUCIFZSeyFlvae12+0q8W4gFESON5ufIxgLwJvtlBuQAKCs13UlC4LFiWcP64KXyFao
    pMByeRLqCN9cJ2MqBzRIqj/D8D1CckRDWCWybhJ7OaI/c9WqlXIlN7BUnngV62og1oA8mFSuWP1y
    YRsGYrli3djbV8mx9EvlEIoIQ4RvUbxc0TBczbR4TWDxDlhXwrpuNAot/ZxdZyfLA8TaYL3Hq/i5
    zySNHNHOcO54UBBA9HUvJK/yYOU544WcB8d7MKt4sAtNf4AI+6UxQpf8HdH/0dOD9CA1Qe7h9Qe3
    SEh5STA0nAAAAABJRU5ErkJggg==` },
    { name: "Electronics", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAAB7klEQVR42u2YoXLCQBCGIyIQlRGV
    FRUIRCUiogKJqEBEVCArERV9gIo+QB+h75nO3uTPbDZ7l2y4EGCOmX8uHMPdfv+/YY5k2T296rq+
    aSWQBJJAEkgCSSAJZA6QPF/V0M2CUPHr9bYVYDjcWC0OIouhMXt6rIvq1TRaYaKB0MZUBAQYnlBV
    nYLa7d6d8P2Lg/jaI1Q8ipZaLBHacMhpLoKL3VZng9CGPmcHHS83nVaEFgOx3sSAAAjW4Gu5zy/Z
    WvIGHyM4HgRZIpHN56HnvCx8CITWuAoQ6aq7lo4370OtBVMWaS2A8JEnod1HvtZqQZZMhCejpSRb
    52pbSybiaztLa1nOYrOASADNcS0R3lrujLbNvJIwk0GwWQhEA4oBcnYi/ES7esvbzfe/p86owYVa
    qwfStNZYCBOI/G/BQTT50pKJSBPwuQViUiIEANH7sjw48T9TFhBpgDvGGCHMiVDxz99FDwLi9410
    uuN401pakhIAe0X7+eVphH4SQ+3GQTTXuVEy+SggWhrFx4MKMQZEFh8S7TlLIsfjl1uYRi5tzicY
    QevRCIMwh2vLgwhTIryQn78X5yhGbU6OHIYXjcIxx9srOoh0U7rHRypEzmkwJF4wv8YeUUF4/099
    TjXm7OS7To9ME0gCiQhyD69/Q3Fkkzcfe40AAAAASUVORK5CYII=` },
    { name: "Factory", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAAB70lEQVR42u2YIXLDMBBFDQwMCgwC
    eoCCwMDAghygBygIDMgBCg0MAnOEgoAeosA3U+d75nvWW8mVI0vTusrMjmTrT/Y/aS0nKoo1fYwx
    fzoySAbJIBkkg2SQDJJB1gpSlpWREVMTDQQJu64zt9tnH+hrE0tpooEgEZLuds99oL/d7kcGltJE
    A7HNIJLTACNUExWEBpqmGQWSt2U5Ch/N+dyOIgmIawa7uh4FxwedHq/s35MExFXLCBgbQmkOh9d+
    5qc0/J7oIFO1TJNoQzTJQK7Xj2+1jPuy3u/VJAfBAysNoGwwq2gR92okyOXybo7Ht7ggdf04mEBi
    JMQ9jKFv06D9ScMghN6ibRG8InIrRUuTMGXTSBCXhhDII0GKfeEMCfNrQAihQaqXMg2Ij0lfjQvE
    BhNUWvIBtdU/jU1p0HdpNAhNaxDbJjALBPs+zDBsJkM0EsSnnBYHwdbK2Q3REEQal6sxtR3fDcKf
    FTTHcgnRIAffNRLG550yG0QGDchnI0QjAWCesTk9xAfB0iPRU7vp+y4NdS6NLCUJgWufN/wsEBqS
    ptjqkPcB6dJpvYZYHIQwnHkNI1fFBWQDlK2E4D3f31uzVkSfdNgM6jFeE9alIYi8jvrHaur4Rh8o
    2K5dGj2e/DgonzRmkP8CsobPF70vdXLpxStrAAAAAElFTkSuQmCC` },
    { name: "Farm", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACKklEQVR42u2YoXfCMBDGKxAIBAKB
    mEBMIiYmJicqJicQEwgEYgIxOTGJqEBOTExMVCAnJhETiEnkJHL/RcaFXd71CG2TNi2w9L3v9a40
    zffr5Vpeg+CUNiHEUcuDeBAP4kHs1Wg0BdVRgoDxdrubEAdL08FVJG5uxaGyZAvjrCIIEkVvRrKF
    sQJJWwocJI4XUmAyb2wDYwzCe4BPmAAxhBj221I2MEYgyuRmovVqJSaT6c6ERUFgLO6dgHAInJzD
    4HmmvfEQnimISkDe41kCYnJ3nXjEIoRpNQAEIRAkuApyw1iBfH5sTDw/iehxmAApAnEwIOfTjtwv
    ZiFcVQrMQY5Gs3IAAPNUTkHAfBbIy6grBTnGmM8GLSX6Owfp3LeqrwhMiiDcaFYOELwSJhClgsDk
    CGIqDmAK4QwEDcFywxximqNhyOE4no/Ha61INOqLKL5QpsEM5NTcz3os9b0c7MT0GIyvBQQg5stQ
    jKfbJxBCYQ4QYPRrHkphTPcUqBYQavq211JQ/ZuGyvNWAsFgnLOnFi4P+Xb/A0EIappD0TufVg0K
    gWNLB+Ewcv3vqQSHyFsNhJDXNYCw/hsP0pnmUCB+99MqQsc5BcGKaE1rIIrI6XuEQvCeoPnla089
    uWxiuI5TkDw9gUaKxk5A8vZEWRBuQTQ9wZdTXRDGFaGTldnYRZrcvkfIhFQ6Q3h8X6y7TiVfGrO+
    Z+l+T4vL/C7sv8Z7EA/y30BOYfsFCCZwKHxQwv8AAAAASUVORK5CYII=` },
    { name: "Fort", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACKElEQVR42u2YrXLCQBSFIxCICgSC
    B0AgkcgKHqASUYFEICorKhAIJI9QgehDVPBm6ZzMHOZwuTc/kGSmzDJzZjeZPdn73d2bkGTZM/3y
    PP/XSiAJJIEkkASSQBJIAnl2kMFgmFv14W0VBBOPRpMb1QnoEW8nIOfzuQjgdPotWh572daso6XH
    8/YGooFQOJ7NFm6mbdbLvL2B6Epoi0Cg1erjKtPaVnl7AdFtsdvtbqQgkZbL9/xw+A69ClN1A7gL
    hMWpRcqJGdh6/XkBQV+F8Wwxln7rJYiCRTB3g3iFjYlsZi1IVNieN5IH0xikTmHP56+uIi/7us3K
    QDyYRiBdFLbdmgTh9lqOh92AtF3YEQivmy2yG4CHthbMyBImQEDH40+twlZF3ggGq6Egrdy1cBHN
    KO84ZYWtKvMqCIO3K9EKCJeTwdisWpDtdn8lBfG8WvwA8WCqHoyVIHxWcGtoMdpjTOhB1PESggDU
    ePNS6+lee0WQRa/Q7fZCu1lM8q+36SXIOl6AIHDCTPfjQp2AQBokpH0EoQFgLAQfxhEIfZxXEHjh
    UWHe1kBwEQZECA2SwjkC2L4dy/F6bL1NVqPRivDCOolO7gXhjfG89tpNIRqBRIFEYOhHCfBkAVp/
    1dW/66oo2xZKk+CN1TrQ2ujknV1hdIWiDHuvsnpeA/e2k52v1RcrD8YG5QURJYHjuSp2FXr/iuJl
    zwYRJeGegNMHugSSQB4EeYbfHxxRKyjPoT88AAAAAElFTkSuQmCC` },
    { name: "Fusorium", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAABFUExURQQECJyctICAgMDAwJCQqGxshGBgeFhYcIiIoKSkvDAwQJSEbFBAKMC0oKSU
    fAA4ALCkjIh4XBRoDCSEFEREXCAgLAAAAKgG5EsAAAAXdFJOU///////////////////////////
    //8A5kDmXgAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAWZJREFUSEvdk9lywjAMRQVlabGdkoTm/z+1
    98qOIxvRZYaX9jhojHIPyjLI8mv+lCLazNXB6ctuj26uHp4C1upx35aX3eEouZZWy1OmLHI6U9Hq
    4SlHVbR6eMr+REWrx5OUV23KqvQRTznoFK382t+Tp7ypopXG5dKGvlNodI6r8LWXqkbrdArfOcOi
    ilTjoYLICncSaAiO+EAxwlkSHlSIAb+fROIDRQa7BrmEmOgMMKJecMnaKThVQTqGgA92NN5JDlsF
    kQqC1yDhSjniXjajU6SuNMIQOGOC8SNlGIOMWGEceJ1U1qhVroY0YgYelmAKMIZRkEgIldUq5rKM
    IhNyBqs0RlVkahCrQECnBKvSG5sSEvJs5SDIOzVmLB40brfbqaItzSnrlHmmodb0AaOkM62zKhMd
    HTNPvUHnfgr/KFNZvYBT6JYcaLY4hfvAISWt8Xxuw+4BA2wxSnK3xW1+zf9RluUTjZGMnJqpHWkA
    AAAASUVORK5CYII=` },
    { name: "Hive", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACiElEQVR42u2ZrVbDQBhEKyoqEAhE
    BQKBQCCQyMoKBBKBRCAQPAASiUDyAEgEgvcLTOCG6UfSNtlNgZ70nDmEzSaZu7N/TUejbfoURfGv
    NYAMIAPIADKAbB/IeDwp0L8EwfzoYFSpb6hsIG4U83vXO8Xh/V5xPB83QuUCSwKpMy/J+Px6t4SY
    v518lE1LqTxCAfZrINE8ra+/QABwczFbAJFUD3lKGwUBAiNqdYf4NDctXp8fSjmIzksRKjWd1iAO
    IfNl9/kyBwRpAIJxXUcdyhzK0+kVxCFIwVsYCJ3DrJ/3MUSCdcn0CgLE1f1+lYQefHQwLqVjnZOA
    oDzCYlz3UB3Kv7tle5jWIIwLABwiAlYJkcxHUiQTYXycbAREhvVgHnh7+T3NrgLxWYpkHGTjY0Qw
    3nqCIR1AgPHZLE7X6PRkUipl5uqUSFzQZFYwpHM2myyARYh4bY7FsVMibsIFiKZewSDq0/LejXLt
    wzqtI0hrBOsF5pWYgICQYT9G57OjHwmkwCTvtVj0JJmliwHj5j09B4n7tS5AySB6cBOI5KDSJ8C0
    AlmmNkBJm0ZAonnp6W5apeLdTwBoFUibCaDzGPGpV6YZB/wPCDCeyK+DOABmveWBeHncX4DwLgaE
    yn3tSIVpvY54t5GYUiUgIqDDCMLL/fplYFlAgIhdBhBMxYGNUT/vE0KcHHpNJI6Hupb0Fvc1xut5
    MuuazzpGdJP4tdRXajenb4JNIBFmXYCs02+EcSiMyegqkHUGN/fudRvfBOTd5OXxbEFxn+Uwdffq
    uk1pnYhvKeqMNGmZ+a4pJCXSBNAWLEcKWV4HYdxN1IF6vbqyP/Omsek4AsZteu53wMPPCn8WZBs+
    7w3uBYez89UsAAAAAElFTkSuQmCC` },
    { name: "Hospital", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAAA/UExURQQECFhYcBAQGEREXICAgGBgeIiIoMAQEIQEBKSkvJCQqNwUFGxshKQICJyc
    tAA4ADAwQMDAwBRoDCSEFAAAAPAit8QAAAAVdFJOU///////////////////////////ACvZfeoA
    AAAJcEhZcwAADsMAAA7DAcdvqGQAAAFiSURBVEhL7ZDbtoMgDESDSCV46cX+/7eeSQJe0NUun85L
    hxan42yDpfdl/ZCr+h9Eflu2ukpVSI4I352rtc/INU3jPMLVHVQhbYOlyOIOqhDXtm2eUtxBFdK6
    EPKU4g6qkYBlSHEHVcgtkBapE3f7hqCoCIrUxYLIxP2TV08NMSUrcoziEmDOn9yCFksNx75PgxST
    4wg3JD92Xd/3XQynCI3QJMXghoHVecnGMfgzhFKMOI4UJ49tMCcZRw9EZVXdBWGRFXHTkKCh9xTo
    LtL2grAjKQ0MxJHz6h6afUFkkkxx6gwhOdhCbJBBxPhrWRF1D8kEWWdskURYTxSfiojjh2Q4mAJL
    tVw5iWpEskmIVylukCkjDASnAcIFud/n13xA6GV64qVRll22nIpOpuBBsmYr4GKBbThp7kGLJZJ7
    uW6bAlUf2tL6QCvagBntqg9tAy3slG/sdZ5+1A+5qsvI+/0H13qDqVyDbhsAAAAASUVORK5CYII=` },
    { name: "Lab", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAABIUExURQQECBRYQAQ8LBAQGCx0VDw8VICAgDAwQODg7IiIoFhYcEREXKR0KLiMNMio
    RNjEVAA4ACgoOJCQqJyctKSkvCSEFBRoDAAAALPJCsoAAAAYdFJOU///////////////////////
    ////////AM0TLuoAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGBSURBVEhL3dLrcoMgEAVgIkVuaoy3
    vP+b9uwCCVG09Gd7MlEH9mPXGcXz1/ljRFydVNwTt+bClLYgmua8UWGDRdPIM3NcF7dATs1hWXxF
    cTrafvktZGUXiDSWqiO5qCNCKRUIRBURqm1blXrUEBKaDfeoICwMmdCjhkBYZ8kkQom7WXKijbTS
    uFYJLz0Ih92H/CBaGqkT8bLrh74LMB9yR9yLKIj70LNxWo5ZYbxHYhNRXvYDBIxzD5DxNdwJ8TwW
    EQiNjRGJtTvCg2Es75zruqEDQA+tmESTEfvq4n37eLT4W4s/RCDHLm+iPL4cxFImiCtCg1m8SWsZ
    THaamGSi1CWQCYDEPO/Emwj5SVAtBHrMC4t1LRNjrDFMSMwg87wsJLZtK5GF39bahQiKQRYK6lex
    lkmK9zT7iCccHpJ/mEXCk+ABp28rfnS5JgRW3BlwcCsRPits0wPV8yO9BgaLZUiGKWRQixoaP6yg
    PAM54VARLlhOG/n5IYeFn/N/yPP5DU3tkTUScUybAAAAAElFTkSuQmCC` },
    { name: "Mine", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAABXklEQVR42u3YPQ6CQBAFYAoKS0qP
    QWlB4SEsOIZHoLT0ABaWHsADcDPMIxkzbnZxmdlFJEPyQmJgM1/2F4tiS9cwDH8dgxjEIAYxiEEM
    YhCDGGRZSFnuBm1+DkERt9tTHSkmCYQQdX0Uh78v6R01JDWC0jSnWRgVJIToui44dGIRlNjeEUOm
    ELi37fkjEgSlOBRfMSIIGr1c7mPRbqggjrheH+Pz7juxiOyQUHF9378DCO5T6G+ILBA0iCI4hAdF
    8zlBv/meJYwWoYLQmo9hw4OiUUhV7cf4cDS/0E4KhBjiFkQhBIcgIQiSAjEbwnvDl1gID+8VKUIE
    oaESSggSCtpzVyfJMWU2ZKooCQTRAFRzxBd3vBOC5kSuU2/ysxZHYO/gK9vqv0dcBAGWRqh2dncv
    4Du2O5xWB6HCfMeNqSyBioZIACHUanokBpVrdcryPZJzObW/gwxikEyQLVwv31CbWaBKdwsAAAAA
    SUVORK5CYII=` },
    { name: "Monastary", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAMAAADGZPh1AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAABFUExURQQECMDAwJCQqEREXFhYcGxshGBgeEAsJFxMNIh4XDAwQAgIEGxYQHhoTDg4
    OFBAKAA4ALCE1JSEbAhQBCSEFBRoDAAAAFmnAaYAAAAXdFJOU///////////////////////////
    //8A5kDmXgAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAYpJREFUSEvt0u2agiAQBeAxEUXWJCjv/1L3
    HBxbTGrr7z47pvIxrwOpLB/HP6mEbOO16SqRBkdunCrzVbKIqHibaBU5tW3FVMlahaI1R1MnHIbo
    QI7mKck1utbYg3lGcg1jOmMPpk4oco1s+jcIlmWRbjqxprP9L4R9iEGwIGNxhXhN+D7EyuBoLHot
    wEsiXYPFjINzbhittM1JVlKmPZCm6UYI7z0MewLwNaGcfkNM0vsaMiIgzuezd2yPs/SDyNRICEHR
    A5ncTHHxF5gBPdYYGplIFBUEK8ZUJv6CE0RmbIU1lACVBOuN7lDFxVzjGYl4IInuJROR+IJwggTJ
    /Mecz3vp13ElTK+TGGOV5OwKgfDjCPMBiXgnDqYgIZM1uUIoZppMAkdzCRV7EsKBIHFb1JZaEIcp
    VyG8pJTumT+NJNeUQEK44ubS1mN6wqzmleSWEn44VdzY4ohIWWNfBZNIvNeAyY/geCHKvfDQQogr
    no2l8lqWQOwK8lu+B9rbTxM0HrrvxN8hy/INVaSLh9dGFEsAAAAASUVORK5CYII=` },
    { name: "Palace", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAADG0lEQVR42u2Yq3LbYBCFDQwCCg0K
    AgoCCgoCAgoKAvwAAQUGAQEFBQaBAQUGBgUBfQCDgoICw4KCAoOCwgA/QIEfoG+gztHMpzne/JIl
    WZpOM8rMjn7dds+3F1nRaPSU/rIs+69tABlABpABZAAZQP4pyHh8ksm6FNXG51EgCrbZbLL5fJl1
    BRR99g6iIIvFIvv98JBvb27usstXZ3vBgasLmfJZF+YoEAVU9mSCAATTcV2zWn3LhR0Cij6vLs4f
    JaczEBd6N3tbmAeVaAnZbne5aS0YZTiV5TKfL59P+gEhy4j5vPiQB9tufhQgDuHZpSqx9+NMyBc+
    vcqdgZT1rwIKyNuJSjgMIBJ28eJ0rwXx6TDy2UtrpfqXoDJmwFvDTeJl7JOMOGfuU5UhTqcgsX91
    TFuJAkQCri/fZN9Xq/ycttpXhh0CkDKf6/v7HKIXEGbi13q9N9gyWkcgEh9N9/q1zFrKpyCYO0AO
    PcYbgSiYTMEZbBdWx/xa3es+Ef3pdp7DeGuNXo8KSwE1roiC8kQpm4cmJsHAVLWWgzhQIxAywACS
    PTKJEN+XEK3Z9+v8XPRJRWTaTwFEiFog3EDv6ikjUxANMZlkuHl0/tntClPmeQggnNbRfTylIgii
    T67GlRCNKwIEZSfDCGGoJV4iMYdhkKmK+6S1XLQgHKT1sOvGyftnxdNEwcoqomsihMOUVcR9ygfi
    61SiFggQgKQqQoaZAweZzW5zS1UlVZHUTAB06IWzFMRnA5CPX87zoNqy/255+mjrEHrEll3HGp9R
    vOxsOSniu67WFZG5EAJxTmvOC0A/dnp3+vpzmh+TQK5L3ZPySRV83fqX3WHIjpuOKTiCp9Pr4gUQ
    kUCkfKR8cjxWo/UrSqxIyupWIop2oVVQnf2H6OWNVWhSiSpzgLqtdFRreRUEgGAgeKPVcc4DE6tR
    B0rrTv9n96p4Kyn7QNBSVMTtkGgEp6zTryjxUUwLSTyV8H2ttU0J9vaJEHEuevkclPpdiX0d16nB
    Tc1BBGoK0fpzkAerWqfaJCW0i497w7ffAWQAqQnyFP7+AtzJKCSEfJleAAAAAElFTkSuQmCC` },
    { name: "Shield", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAABBUlEQVR42u2YsQ3DMAwEXajwUB4i
    RQbwGB7BY6TwGCm0mQIKYCCkiEWJFGHjBXxr8qAHn/I03emklC4tgAAEIAABCEAAAhChQphTqUuC
    UOPH8c7a91eWBYwpCDUcY0z09VLL8lSHMQOhRvkG6DYYYl23DMIwDNRrvy6Qf8VLEIYhCFZ5Kxr2
    awapKc6AJRBBzI/wlZb9mkCkxX9vrpTEfqogmsWl9jMD6S0usZ+ZtTSK19pv+NSyTm+zqaXZuEuO
    aK8dLjmivXa45Ejt6G1J/6E5Ujt6a1cP9xw5G72S1cM1R85Gb4tlXHNkVPq7v0e009/9qTsi/fEX
    BSAAAQhAAKICcofzAReS14G9XAkrAAAAAElFTkSuQmCC` },
    { name: "Starport", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACvUlEQVR42u2ZIXIbQRBFBQQMAg0C
    AgwCDAIEDAwMDHwAAwODAIGAAAHDgAABAwODHMDAB9ABAgIMcwAdwCAwd9jUn9RXfXW6d2ZVo1FF
    JVV17eqPtue/7Z7RWh6N9unVdd1/HQeQvQcZj4+6mrETEEx8enreXVzcuHF19TEbt7d3a1EKUw1E
    Ic5O3qWANplcJi2Nvz1OgXPC4Zyf12sAwffNQAiBO4rJr88mnWqE8HR8/vLD+zUI5mkKYiEIguP9
    p2mKnA4QzQNo1ZuBWGPz+Twdv93N0gwWBDo/D7M0HAE2A1FjMEvDz/OvaaxPBzQNax6ONQWJDENb
    PD7+o2M+6loRzaN604p4hqGpzpZTXQ1HgM1ArGGCfH96Wq2RnG7z7ASkzzCC/e7pCqJ5AEG9KYhn
    GHmt4Ui3eXYCslz+6jzDPxeLFCU614gHUvIsVgWkz7DXcp5u87CyCfB8FAZhqoFEhq2xSI/yNAFh
    eaOKIG+pHuXpA6nSWkhydD1e9bZnYPnyIwV1PEvh3NP78uQgBoPoxQoSGVNdHyw93cuDKIEYBMKL
    9Xj8+U1o2Ivp9Esa16DugZRCDAZRCFTDq4iaxkKeze6719ffawHdhubBY/wQiGIQGmcFcFQQGIdh
    mMfRmiQMjhx/eHhejeMcOm+Cty5yX4yDKkIYhaBRa1Yj0nVMwUcnf81znmogtpUUImqf0sC1qAhD
    IRSmakVYDQ9i00rkIEp/FhrcWgqhbcVeZ78rBDVdD30QWgW9eVVai0dvx+HC9VrMGvYCEArgtXHV
    iuQMeS20CYTd6quCbOPnUN1EbHCrt1/E1daI3YIjje/tdh0ZtwDaUltZ7BFABKrG7AL22smuja1U
    xE6gEDj37r4+k9l26muzIRAb7Vp9z1wl41GeSK/+N7tNmJssGo/y5OY7/MfqAHIAqQSyD68/JjHB
    iHJrqbIAAAAASUVORK5CYII=` },
    { name: "University", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAArCAMAAAANOCvQAAAAAXNSR0IArs4c6QAAAARnQU1BAACx
    jwv8YQUAAAAwUExURQQECICAgKSkvEREXIiIoCgoOGBgeJCQqIQEBMAQEAA4AJyctFhYcBRoDCSE
    FAAAANH4oKMAAAAQdFJOU////////////////////wDgI10ZAAAACXBIWXMAAA7DAAAOwwHHb6hk
    AAABD0lEQVRIS+2R2xKDIAxEQ0DoTf3/v+0GKiSIdnx3Mym4yYFUab2sG7mqG1GSp/6Qndc9IJxl
    ssfaM3tHRM7bU/ae2qNEoS+PvN+KHU+ROUVdpjA5ZjZeQ1CdpuBD8phkU/EiHyII/zAKmOoEiSlh
    qqcRJsVUh0iKMSac7FQyPD5DOCYZpAYTwztFMBvej06G9w/xNhtSVDrzL4QhpHyEvLJyd4/gFajs
    kPEtHJ3KiiiiR8C8VW6IJgb/5a2yeBmohEEQH7RsKe0SgsyN0IioR0QA5qURFaFlRizBCt0L+lEY
    IVLLhxrhAkGGt5RrSjkHTq5P23cvansiObFQeZEVafshgw/1Kzbtnb+6kWta1y/R6mKjMbb3gAAA
    AABJRU5ErkJggg==` },
    { name: "Vau", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACeklEQVR42u2ZMVYCMRCGU1BYWFJQ
    WlhSUlBYWFpYWngESwuOYGnpETgAB/AIHsHCA3iHyL/rD8MwSXbDLgTe8t68wE5283+ZzCT7cO6S
    Pt77s7YBpI2NRlf+7EEAsfxa+b5hjgIyfr7308VTrzDFRORQyKOApKLRxfI7Csj3708S5PHjdQDp
    HQTCJAjN6kOQXJheQCgI6x62WL3XeXI39e7G7UGhRR/4qzYDpnMQKQ7iIUzCWEDwI2qICq8XExEZ
    DYijQFwDjLzGvcbdTMoDgVjMshQul5S+DuAapiAQHRUpWMPCDx/aYkEwy/XSspcMYQjE/CkyR0JL
    y4oMWkSlmKpllV6Z4NYyQ9RQtYoAkbMLUTIqAKJQC4T3nAxE7hsUEjMrXwgC30lAJIQUk2pDICzB
    J4sIE5UVKtXGQODPOXN1kiOyjEJIrGWOWBskC4P29wYiBdC4LFJW7RPCeH0XZNL6yNIaROYCjRsf
    kt0yHhxpGgYmD5SE2BYI563J6yQiUhgTGWcrftemfQQI5dF+tXN7JmGyQeQgGBxC5dLQEJavSuw1
    jI5cuHR3CFLvwq4SoKNC46bYxMfItIU5aGmFICyT4lN9m8Iw+bNBmFyE0MePGEQODIuHhNk+y65i
    SRDcdPs2rh4wfrnegcDat4yDzmYPG5N+ea8FY0/Mf27MM0CqpF6LhwEGxt8pWy4/N2b55bPqiZqE
    be42fUN7ShKEABxY/tbWFEKDNOnDMbJALBhLvPwN8VYbgtZAsbFiO3zjZJcP0w+PDR4Tpe+Xu7bu
    kzqmtALRg+hjfAjUEma9BoReETo9NOpjd+x76N28z3+vhv8QB5C+QS7h8wczHhqQx8bE6wAAAABJ
    RU5ErkJggg==` },
    { name: "Well", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACJklEQVR42u2aoXLCQBCGEYiKCkRF
    HwFZUYFE8ADICh6BB6ioQFQgKpEIRB6gAlkR2Qeo7Luk/TvzM5vt3uWSy6WFOWb+CeTIf/uxexu4
    YTS6pEdVVWetDJJBMkgGaafx+KrSGtIjCKTJEOOTyW21e17Xjm0CifVoBOEENNTGHH8tXmoBLOfT
    4EB8Hr2DMCgdnAyiPB5+glg/zDuDaI8kGSnLstpsNrX6PUsQCSOBdFngXGxpJQXha8DgSCBddtvt
    wSzDfwOiFzzP6QwRVF7nu36Q0pIT6k8eAbMRQASSIMiOlMyYHqNm1+N0IK4eTxgEQCCC6AAtD5wv
    ircaRNLS8t0nCLPfH2ulpSEsD0BQhLj5DicpiKu9MgsSTIMgOMtDZwLvw3GxWP0C8X196Q1EwrQF
    IQSFcxKEmk5nNUmYTqVlgbB8AOED0R5WJiBZWhogCYjuTITB8+X9XbV9XJ1keUgIZgJzhoBImOjS
    sjqTBEGQlOXBcmImMJ/uWslBrHuABsE1lAtEZsK6IboAOpeWnMQlDfL58X6SBSIz4bqz+9ZGNAie
    47Ji93T6xDHGxS5LC2NWaUkIV9ZDIKJBoCYQX2kRQgYqx0MhokAQBGu7zTF0DYS03GgQGRwV+joW
    pPc1Yu14NCl0MQ+WkS5BxHo0bQ8lA9HZiPVI+u3X1eN9W0ZdPQYD8U3eh0evP3WtHh86eR8eve39
    /vX+bt6NzyAZJINc1F8FRl/iqHYDwr2atwAAAABJRU5ErkJggg==` },
    { name: "Wetware", sprite: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAqCAYAAADxughHAAACI0lEQVR42u2ZIVfDMBDHKyomkBMI
    BAI5UYlATEwiEAgEYgKBmEBMICsqEEg+Ah+Abxh6efzL9Xrp0jXd0r7uvXu5rWl2v/zvkjVLkim9
    jDGjthlkBplBTgySpgsD63JPVCAU0P3Xm0muL61xqDaje/rCBAOREJvNs213u8Kay5fgZwWRENvt
    e9W6fAK1Styt/tUr/WNhgoIgqC4gPAX7qNIbhL54tX+0RiBIKWpdPvrLWooKxKe4owSpLbkliAX6
    C7atReAIvm/BB1MENeIDQn2hSFXkrOjPBkKBAQS+yxogDCCK1AKIj2EDBIj0o1Bk+bS2xgsbPq6h
    v0yt6EDkCsXfN0AYQFQbIpZWlwFEplN0ikgF2hRpQIwaZCyphaVWS60GxNRS65CdbEPUHpp8Ugsr
    XnKbtJoGM2hqyR0dqbX/+VRTyxdEgwmmiA3OUxHqK1OLb6RRgmg1UwOJLbU4iLZacdNSq4siwUD4
    QC5FqoIWfkMRBuEDEGTV4gPxdKHANBDeV4Kgvw+EzzmZN4idudcLaxh48ZDWYOTziCx6pJtMLRcA
    xg++IVYrTwlDXwIoPsMI4uM7M1m2Nnme21MTeo9rWn8evBw/KAgUgN0Uy2rGENghCAQn++NzjIlx
    B1FEKoEWPtlLcdWqhLyf+5rSXX53eYFoBc5nDwoRAJ1bEQQMB3N0HbPPIQBQ2zQ7pNRRirhO3fuY
    a+z5/5EZZAYZCGQKr1/arCwR+tMzhAAAAABJRU5ErkJggg==` }
];
let unitsBase64 = [
    { name: "0", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAg9JREFUWIXt
    kx+U41AUxn+zJ1AIPFgoBgYCgWAgUBgoDBQKC4HCwkKhUFgIFAILhUIhsDAQGAgMDAwUFgrBQKCw
    ECgWCoFCz3kLnbzTP+mZnnZs853zTt7Lue9+3/3ufVCjRo3/HXc33pe35r9WgASYBn0AZrMZo2DM
    /M/bQVDfn37I8+UKYjkN+qTzV4QQCCEAyNIEIQRuq81ymbNc5kyDfinyrFOXCJDlMg2NaOrjttpk
    aYJlO8RxTLfbPblkWbYSFE39syK0D4gJ/ab6MYlWBONfmMb9AallO2o/8oeMgrE6P0chlmWTzl+x
    3UfJUTvOOSBDv8nAEyRZocjbrg7AIv9LHMc7wmDMyB9WJhn5Q755P7Bsh+corGxH1XDIgSdYF1sA
    HEsnyQqErrEutghd421eYBr3laTjbMXkwWIwy/jddfgeJwAUL08qxnYfFfdxC2ToN0mygiTdMPC+
    MolWAGq/74I//InXDw4ztEzGs2xHui5IioKk4+A8dHdf160UXlYuex1dmoYmQ78pTUOTvY6u9uwN
    5MAT5f4kzwVL4WAGTKPxXt2WRb4Bdi1Y5Bscu0Gvo2MaO9Mm0VrZeIS7C1a1gEW+IUk36lzaXvbe
    sXTark6vo1fwXoezz9A0GsqFUtR71YR+k6eX4lMEHFsoTUNTlTt2Q039It/ux5+8588SUCa/NLZG
    jRo1atyMf1L63NwfgxVaAAAAAElFTkSuQmCC` },
    { name: "1", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAyZJREFUWIXt
    li1wIksUhT9eIREIBKJFCwQCEYFAIEaMiIhARDwxAoFYMTICgUQgIkesQES0WLFiBCICMWIEAoFA
    IBAtWiBGIFqsoIoVga5kGRaym3rP5Cjmh3u+Prf71sCnPvU/q/ABNfZ/U/dPAZxpbygAqMkKa50B
    MB6Yq+u/F2D/2vRoDDjz94K8B2DfGwpqskKSary2RB7Mp8kK36ujdUaSagC8tvwVJNfrn/eYh12f
    tc7w2tIZPak5sXpZ6fGeECWSVLt0+l/uIH+vXAWwX5guYdcHIOz6buX6sMJo7BP2ps7c9+oO8gh3
    DuLaBFjGguhpSn8Yow8pKLXEa0u0zojGL4Cv0xCiRNMrM04mlMvlXIjrAPQ9o8kI36vTDZootUTK
    Chu9I0m1S2SebOkEwgHO0g3zZEvTK6MW33JLX53AYOChdcY0WaHGAXUpqMoio0GHuhTUpSAa+8zS
    jQMKggZVWWSebLkp3mDM5iSF4hk/98IinbDdZui0Co2MmvV4ThYotQTgOVkAoNSSIGgAMBwmCFnC
    aOsKWmu5n2nE95De9xm1LNsDhbyjsVfRACFr3N91AZimE5aL2VVJGaPfXms3C2i12/DwyKzTohXP
    CH78yE/AGI0xmod+4O7N0hQhRd7rF7W1lt6XEKPX7vqoc4PoTQsAxtEjyTalf9dnNBkhZOkU/FXk
    ABu9c7/b1fqhBV8R3QdqWQZnWvAGJPzXoxc+EAw7BEGDtc4Iuz79YYzRFiFLCFEi7PqsDnGHvSlV
    WXR7QqklN8UbV9RaS5ysAAqXTkEh+pa4/ktZwffqRE9TjLbOAGCljRtMTa/MRu9Y64y1zmi1qzyv
    5yfmcOUxNOUJ/bs+abRD68yNWHiJ3RjrzJ/U3LXiOJRiZbitNU/M4fwxPNFoMgKgpasAboVHrXWG
    MZZ5sgWgEwhiZX5rfm0ChX6weOm1LGGMJVaGplcmVubNZjxOwqosYoyl6ZXdszxzuD6BwvPX7b5x
    W8zd/YCDMsYedr91p8Bam/ufXKIL2gM0bi9zb/SObHXZ668/ySr104evjD/8k+y3MB9c91Of+m/0
    ExXcopw4XJ4fAAAAAElFTkSuQmCC` },
    { name: "10", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAcRJREFUWIXt
    lSGT2zAQhT/PGBQUBBgcEDhwwMAg4IBBQEBBQEBAgGFhQYGBf4bAgcDCAoGAgIADBQYBBgcCDAwK
    AgQOGNwPyIwLGiu2lTQ3nmP1Ax5ppX379FYaw4ABA/53OD3zqo/i7iOgSjaSsXgAYK9/WxsKrdl+
    f3pXnd4OzFcx2W5PqVIA3EnASHjcCY/ZJHy3mL4C4NwGpzMHYL6KAfCFMEKaguu83g5shYs7gll+
    7PIYIfNVTBROrWSVpbUrzsVErpyqxnPgEqox+28Fn/1PPP4ozVqyka29hdbGBRm31zi8ngsFydL0
    Ti4SAH6+bKzio8WSt826FXMfF7ycCo/FA7F84ms0Nxe1C5WlHA6aXK7PAprKn3cZAPf3wj69+sUs
    +mLF/NA381ddcic8Kzdf79qBhgNwsjtIluTy7wm9aGqRlCq14qVKzaW7JRZgK5UR4DbiDkAu11WQ
    LAEosgKA4y5v5julSqsTBZFFf8ZRlxfjXujXr8G59goqL5oaG68IaZNecisr8BqtMfFTcfO5JqJJ
    3O1pfT+a/a+FdnFBuGMNbgmp4U4CMx4Jjzdd/tOZW3V6/Qs+iGfAgAEDBgDwB6VLqgPPmDkbAAAA
    AElFTkSuQmCC` },
    { name: "11", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAUFJREFUWIXt
    lSFzgzAYhp/uJiYjkIhJJBIxMYGYmEBUIComKvkJiApExURlRcVEBRIxgUAgKysq+wMQEUhcppYr
    BdbdrXC3jfcuXPKFfO9D+AIwatSo/65Jz/nVJd8+AbrMa959ASiAXAiOr9vG5Hz+rCEG2wHbftT9
    /T4fBEBDbDbvGIaBlLL29PrStuha6jDXEDdDmH8hdboDCsB1Z9i2zXTaoCUMI3zf12MpJVJKqqoC
    wDRN4vgNgMViiXh54i7dNXJEUUhRlHiew20X2uFwbI3HcUxZSkzzXsfyPKEsi9p9nueQC9GaY7Va
    k6Yx0KyBq74C153VxlnWPJLnNfCTUzE5a2TZFsd5IAgCLMvqWtOrFKDCcK2SZKeCIFKfsSEIvvUh
    6izCa5jnQpAFy8bkCcDf/Rldgui9+EaNGvV79AGDMWriFOKZ6wAAAABJRU5ErkJggg==` },
    { name: "12", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAd1JREFUWIXt
    kq9zo0AYhp/cVCAQCETECgQCiTyJQCAqIiojKvsnRESciIg8ERGBiDgRUVERURGBWIGMiEBERKxA
    IE6sQHSGEzQk5JpMejNVxzPDwPC9+73fj4WOjo6Or6G6VfjtC4yrOF7dXETvE4kvaQ+xajyetwKT
    ydNnPC6bx/Gq4uOOzmOVZfWrMBxe0nP+/6YVSCk5Gevp04qF4ZDn518IIa410yri7opvI1ospsCI
    OF4xn8+wLBshBEI4pKlESoll9RmNHgEb27bPc/QO5lLKlknvTNgQhkN838fzPBzn2JHvey1dnhdM
    FhtcQ3F/H6B1yX6vcByD/b5kvV6zXP7kYF43c7wXPaAqihKAzSbDNA1c12kMtNYAmKbZaKAgSXYA
    KLXn5WXBYPCIbdsYRq0LAvf9nGC73ZFlGUopNpuULEtbE2gKmE5nAESRj2mKxvTQaZKkzGY/3gvZ
    wm9VmwgPrTVal807SVKC4DumaQDgug55XqC1pm+UyG3BZDI+7ibLMqLIJ0l2zaF6AmXzvdtlvL4u
    MQyTKHoAON33X3hevS4pZWtK9Sp9lFJ1AYPBEwBpukYIl7e3kjxXHybN83r0/b570fgWDnkuXsIr
    /MuZa3k6Ojo6Ov5z/gBwo90cANx7dwAAAABJRU5ErkJggg==` },
    { name: "13", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYFJREFUWIXt
    lKFSw0AQhr8yFREnI09EVFQg8gCIioiKij5ABALBIyCQFchKxInKPEAFsuIEoqICcSIi4gQiMuIE
    M0GUZhpCC2U6A+K+mcwke7v7/7uZBDwej+eP6Z25X31q/1MN1Edq6vv7x1ZgNrv9jcZhcaWWNd0p
    WzlRdFknSXoorxO7OMWB1hqllrtGnStJUpSaI6U8NEDHRP8Huk3BYvEA3KHUkizLkFJirUVKiXOO
    m5sJEBKG4X5tbyeute40//x+OitKkpQ4jhmPkyYWx8Pm/vW1ZLbYMAgsk8mIqnIUhSWKgg+jc3bi
    2wHamvsPdVk6ADYbgxABg0HUHFZVhRCiOYeS1SrH2gIXXhGUmjAMCYJtzmg0QAjJy0uOMQZrLQBZ
    Nm9ptwwotcQYw3gcs1rlCBHsGdiay3NDnhvW6yeur+/2191hOByitW4Z3G4wJk0TgF7LwHR6C0BR
    GPr9gLc3h3MOY56/6t/j+BfxHZ0NcKThuX9YHo/H4/H8H94BH3OcWFwTmO8AAAAASUVORK5CYII=` },
    { name: "14", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAWlJREFUWIXt
    kSFzwjAYhp/tJiIiEBWIiIqKiInKigoEAoHsD+gPQExMVCAR/AQkAjGBRCKQlYiJCgSiAlExUYHY
    XSYYXIHCdTezu+VRyZsv+Z4kYLFYLJY/jmmQNak5ZuZy7fFe8zhOqhvrsiY1AMb3O2y3BWmaXa7d
    xcxmSxPHSdX+KmtSMx5PTZpmZjicmMFgZHy/YwDzUNf0OAjDCCEEWmt830cIcVbYbjsASCmQUpKm
    a1xXsdsVZNkGgP2+ZLVaopRLkrwwny+Ioj4Am03OpYAJw4ggCOj1uniego8cWgqAstzXPlO77VDm
    GeWTc5Ip8wypNHzueE0mOI5DjqZYv6GUOtSU5ZUAgNE6QMoWAJ1OlyjqV24rrzYMxsvTeL0Y1UoC
    ZFl6ldUJQOUbXPcZx1Eo5QLgeR4AQkikPHxJURTM51O22/ebzW/1uyVQK1NF6+Bs/n27Juf9WOAW
    l2K/OctisVgs/5gvFOuZO32JOywAAAAASUVORK5CYII=` },
    { name: "15", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAWJJREFUWIXt
    kK1Sw0AYRQ9MxYoVK1ZEICIQKxCVFXkMBLIPUIFEIBEVlQgEAlFZUYGMqIiIrKiIiEBErIiIWBHB
    zCKadgqEnzqY2aO+v/nunQuBQCAQ+Gf4H/qjOT1C0I/HN7uZB/xkcveVKd8zPxo/mdwdPvOAn06f
    /Hh8s+8Pa8BfXV1/uvnO0Emf8GEzn6ekaYrWGmMMcSywFqIIQHdXNctlTpalzGa3gMbaGoCiKCnL
    gqqqyLLFJ92PBnySXDIajUiShOHwHCkcDKLeiJxzSClxzgHw+Ligbbd1nufdzdaIMUPatgVguXzY
    63+ZQBxfoJQmjg1CCKqqAkAIAYCUEqUUTdOglGK1egZAKY2UGiEEUkrqumazyWgaSxSdd3vF62vL
    er1i0GPgBODlZdMZMWi9fWiMwbmWOD5juxPc3y+6vaQo8t6kdn+tLb215btZXwK9ifyS3/wLBAKB
    QOBv8QY9DI9LsKs8YQAAAABJRU5ErkJggg==` },
    { name: "16", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAWRJREFUWIXt
    lCFzwjAYhh92E4gKREXExASiEjGBQEzyA/YT+AGIion9gAkEAhmBQFYgEBMIBKICUYGIQFRUVCAi
    KuI6Qemt67htdytmee5ySb7c973v5csFLBbLPyT/uLm5trjvT2omGhf9PHx/Uq5vGxZGyhWu6yJE
    B4D9/sB2uyUMFQBNGcjPwt3uXe1Qa40QLuPxC62GDEBxA0XPkfI0C3FPv/9IkiTsdutmDUi5Iooi
    AJIkAUCpCGMyALQ+li3481cp5QqlVCW22SyZzRZEUcRw2COODS0gXy5DAHq9LgBZZkjTI0K4OE6b
    w+HkXggXAMdpA9TiAGl6LGp5XxqbTucYkxEEc+J4X7agcgOdjgBgOJKV5DB4BqD/9FrutT4JBsEb
    Qril8UsMBg8AaJ0CtC69gdzz+gAoFV4sdmaxWNdixphyrZTC8zx8f1QRv1Sv8lF8q17k/HL8qKDF
    YrFYLFfhHdgIm7L0A3NRAAAAAElFTkSuQmCC` },
    { name: "17", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAATVJREFUWIXt
    liFyg0AUhr90KnoIBAKBROYASERERI9QEYnIESoQPUREBRKZA6yMiECs4ACVK+KoKQTYsFlok860
    +8+sefv2/f8uj38e/Hcs7sRTj/E/zCg0eaVphhAlVfXRrjTNAOrHKcqf06K3mURPxsNB4AGQ5wV5
    XrDdbjgcyl6OSUC92+21YlOh1In1OgFg87rHoy9grAfq1erlq4AyEsRxjOedxQ2FBoGPlBVvueQ9
    S4bHF6YmHGucHoQoUeqkxaMoRMoKgOUybAk1BTYkjSAhSo5Hie+fbxlFoZZoQzxHAFi+yjfqO9wf
    t/pGo9Y7DFyz4h+33iFB1wm1zVtY7xDNk0xyPqB1v6nOZwpY/+OX3M/W+a4q6gq65HwNWRdziG0T
    /77zuZHMjWRuJHMjmcOv4xOYHvOwk/zloAAAAABJRU5ErkJggg==` },
    { name: "18", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYxJREFUWIXt
    li9vwkAYhx+SiYoKRAWiYqKiohJRiUAi+gEmKhATFRMVfAAE4sQ+AKICgUAgJhGICuQEAoGYQCAq
    JhC4TgC3/gMywhhL+ksu76V36fO+711+OfhjVW7Mi7P8WyUQA/i+SH0Uwr9KB7JV5dTvv8m5ZRly
    btvmRQmkgJ7XRVEUTNMEQNM0uVarVQt/4LoOi8UCfnAEEuo4z+i6LqFJYBF0vf4EIIoiwjBkNhsz
    Gk0AsCydh1PVJaGGYWCaZqqFrusC0Ou95oBJDcMIgPfZlFarTRAM5VqyA/EBpGlarjIhujkYQKfz
    QhAERXkzny8RwqfZfCIMJ3ieT7vdSm6pHDoQ+76Q5wjpywJIyKHqpAzjkeXyA1VV2Ww2+30O8H3z
    FUVJgXMT9h0AqFZ355jtQpFWqznbrcJ0OqbRcFKxXm+iqiqwuwO2bSOEn+WmFF8yBoNJYTwyfkXx
    kVi0L5VM6YR354Rnq7m2E5ZGVBrRtVQa0Un9KyM6Cy2fZKUTZlU6YSLxonj/+gIxtZH4mcA8iwAA
    AABJRU5ErkJggg==` },
    { name: "19", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAZ5JREFUWIXt
    0x+UG0EcwPFvSgMDCwMLCwcLCweBhWJgIRBYOCgGCguBQuAgEAgcHAQPDg4OAgcHgYWDQCEQWDhY
    CA4EBgoDP0vhXva1fX1poX2Fzue9eW/o92fm94MgCILgf9f7y/GP/7KA42SyYPpxBFGC1prDwfHw
    sEJEKMv3xHHGu28q/aPn8fGF+XzK3sH9/RNN85nZbMF4/AGlFHXd4L2nBxyn09uubOccr68NaZph
    jEEphVIaEY+IoJQCwFoLgIjgvQegKAqMMVxepngvbDZb9vuWfr9P27ZorVFKISKs1ytWq6fuC45l
    WRFFEVU1Zr3eoPVbImMMzjmSJEFEcM6R5wkAu50lz/vU9QtXVyMmk08MhyWj0YDZbIG1e7SOUEoz
    n1dcX9/i/Rfadts1fPqC3vPzHU2zpaoqRDzWWvI84eIi6bo93Q8HuleIY4OIcHOzZDAoAFgu7xAR
    sqzPcFjivaMoCna7+pS8dzo/DmE3tXGcopQiit4SaB2RphnOue5lrLU4Z7/r6IyfDvy5LfjlCv1m
    nCAIgiA46yuDTr5qnBhRjwAAAABJRU5ErkJggg==` },
    { name: "2", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAftJREFUWIXt
    lhGU41AYhb+es1gIFBYCgUJhIDBQKBQLAwODgcLCQHCgECwUBhYeFAYWAoWFhUJhIBAILAQKhcKD
    B4VAITAw53Sh+3Kapp1NdmZOJdeS8+fe+/77v/8EatSocWE0KtbvPpq3ioFdHM4JgwVX9jUA0fY7
    ltVCyoS1TPbvwg3LxWtp/i9lxcXYxe7dADDxbQZ9mwE2AB3LZCUVz8EKAF94LJcxk+lcd+yskUod
    +Fu/i9XwZMEiiFnLBLc/5Uk80jSapNsUMQvOapU1sBNjF9cTAHwbmwC0rVZWcBhB3+gBIGYBvvBw
    3PG7DQDsgvkPlvFvlJIAPAVzvlr5FDfylWSfBL7wiMKwcgfKTvqb0OKANnBS+9hANukac+Vjms3s
    WakUJVMAPe2aIzM+GTkoqXLit/0Od5HE/DnFHD7QThKAxqGBXM6De4Ohc12w/RysaFstfH/J6Gak
    82V0v78hhmFk4gCmtZ8XJRXdXg8eHoluu3R/RTgvL/lrqLMFMM1mJnaIttXKBi7/7YY0TQvvtYE7
    Z4iSawC2B3WFCPRJ9Gn8eFYg1fjoCDgmeg9OmTjCySF8C5VXcZlr+Kmr2HHH+MI714FKBhquJ7JV
    POjbhYKOZSKtfReu7C5RGOZ2wVnikgb+exX/S+dTV3EZ/ov/kNSoUePi+APPOiT7nVIjQAAAAABJ
    RU5ErkJggg==` },
    { name: "20", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAjdJREFUWIXt
    lRGY40AUx39730FgYSEQCCwMBAqBQiFwEFg4WFhYOCgsFIqLhUKgUCgUCoHAwkEhUFgYKBQCgUAg
    EAwsDCwEznJw2+w17e3X3vZupf/vG3gz8/7vP+/NvIETTjjhg3F2RK7qb3g/HSv4aBSQpgWjUdAU
    818EUJY/AFBKHeR31BK021cAxPHj3txHKwFAr9dH086b882xMf/5LUJeT/G7vVVfKSXLZU4QBBsc
    YRhtEV9fd6o0LcjzAiHMjTTVxGEYIaVkOh3U9nQ6RcoHwjAijhPabRsAIUy63Tt6vT5ZllEUBUop
    dF3n9vZ2I7jnDel0HGzbJkkSANYZqKIoI01zlFKUZUlZlvT7HhcXOmVZYpom9/dj4jghzzPabRsh
    TAYDrw6gaefYto1Sqg6wFjmb/cpOlmX12mo1rwWcdTpWBWAYgvF4xuPjvCZo2pqmYZomQryecLVa
    kec5AN1ul+VS1mvr4ACWZdHrdXl6UhjGZLMEvr94qZNLq9XC8yY77bu7rwDY9heenxW6btYluLqy
    cV2XfbHzEg6H4zftF5wlybLy/QWXlxoPD5IkiZByUa/vI6C5qXLdb1iWxXweYBgmAI7j1naSLJt+
    lZSSOC7QdX2dnXf1l11vt/mOt3z6fa/y/cVbe3ZiVwkOVV/fnVZLHOj6flS+v6gc56ZynJtKSnlw
    Bt7dijVNQwjBbDYhjgvStOAQEX9qxXtj3VSC4DtRFH3Ib7jrtMf8ZU844YR/i5/QnP282TJIKAAA
    AABJRU5ErkJggg==` },
    { name: "21", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAp5JREFUWIXt
    lS1wo0AYhp/eVERURKxAICoQFRWREREViApExImIiIiIiooKBKKioiICWVERUYE4EYFArkAiKhAI
    BOJEBAJxIgLHCcpeyF/bm5ubm5u8Mzvh3X2/n/322w0cccR/guptfBpf/kRw34+Yz4Mmkb+KKorS
    ajZ7+e0KnO5y+vZ7soNvBcnzH7ts99lv4cuaqOKtnLe3j6xz0xzTfCfJEt+PmEwcpJRoWhcpJff3
    z0wmDlGUKj11hSiKshVjfZw2oiTJKIoCw9Dx/RW3t490uwLD0NF1Hdt2eX2NGQx6ZNmSsizx/Yjx
    +CsAZblCCKF2Np8HpGnKYhHQ6/WYTBxubiZ43qJVgVaZNM1AyhDTvFKCTZ4kCVn2neHQAsD3A/W9
    izc2vi+5vDTwvIVKGn71wEld4kAt9Ptmy0m/b+L7z9SJ1jvN8+xd/Wh0B0CapnQ6HQAWizqOEEIl
    UM3nAUmSMRzWjizLagWzLAvDMAA4OzsDwLZdDOO8pV/nlmUhpVRJSSkRQpBldeJZlm3fgocH9yBf
    rVaf0je4vq435vsBjnOn5tURTKdWZZpjLi4uAHh6qh0NBqbicRwqRwCuazc3Zq9+NLojjlMcx1F2
    zVGsNy1ApWlGFUVppWmGGps8SZZVkiz3rm9y23YrKePKtt3Ktt2d11AhiiLyvAD2N9XLyzc195Em
    DENJGEo2oB6lVhNKGW014XpTGYZBWZbKy0eacDptX0k2XsStJpzNng7yoij2rp+fd1q8OevNoPuy
    qXq9K0zTwvOe0TQdANO0kDJACB0pveaZJUki8jzDtt0tfcPjODwYHNoVOInjsBJCp9sVjTFC6JRl
    iZQeAMtl1nIQx/GWfo0fDL5PcOjfcJ03c+/pjzjiiCP+bfwEy7d3NgauuwMAAAAASUVORK5CYII=` },
    { name: "22", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABE5JREFUWIXd
    lyF06kgUhj/2VCAiEBGIERERERURiIgnEBEIBAKBWFFRUVGBqKhAIlZUrKioqIhAICoqEBWIiicQ
    FRGIEREjRjwxAoGI6DmsyGNKgELpqt3/HE6GO5P5/7n3zswN/Mex+qT9ZfzxDUL7e3ycsKd9kpiz
    U8h7vQukVADEcdt29Hp9pJS0Wh1eXp5XnneOUvMVUDk26dEBa/JO5wrf9zk7y1kuC2MYhkgpAZhO
    J7RaMb9+FZ15/ovxODnK8eUQCCEIgoCfP1McB+I4JkkStJ6j9ZwgCPH9kCzLqNcdpFRcXw/hSDiO
    CdiMr4VSxrZd10eIczzPZTp9AsD3QwAcB1qtzkERmwI2EwxgdXs7pF73SZKEOI4tgee5JEkCgKmG
    SP2O74dIqVguP8QplXF+/mPvotY8awGrIIh4fJwQBJFVvF7JJoQQ+H6IMQYhBM9ZB899L41ZC3Vd
    n9HogTBsWuJtHuuBdrvL3d2QMIxoNFqs3d5stjFG0+9f4nk+sMB1XaDIgx/LHst1Vm6gXq/xNp8C
    cH19Q6PR4vp6WOLZDgE3NwPbfni4tyvudi9oNtskSYLn+Rjz4eb5fIbjOAwGfaIoJAg8UpmilCRf
    FF68v78DYDb7ucPzaRJeXV3z9PRo/wdBwMPDiOUSBoM+YRiSpind7gUA3e4FSqnCm/GfxPGfBEFY
    7J7QAyCKdvJhv4C3txcuL9vU6wFpmpb64jhmNHqi02kTxzFPT4n1VKPRwnX90nhjDOMk4e3thfv7
    AduwJ6HWeqczyzKiKCLLZkANrTVxHNv+29s+tZq7Q7h+5nlOGIZMi1SoAKttnpKAzRUBCN8hTVOi
    6AeLhcEYw3Q6xZgMKBL39XWKlPI38YLFYoHvN3BdF2OMPSk/47EChBBMJqUDpzJOktXNzZ31gOu6
    xHGM4xT3wMtLsbQgCBBCsFzmZFkhZo8HLM/6DIGNHMiyQqnripKIu7sb0lSSprO9220fqtUqWmcY
    o9dxt/dBlklc17U8mxfFqtO54vn5Ycfe6/VxXZfptHwkh2FElkmWy0XJ7jg1qlWHs0XK6zw7yFPa
    Be12m88wmYzpdi/I86V9aq0xRkM1t7YwjAob7CPf4dkUULm8bO97oTIe/10yNJsRURQjROFGr+7h
    eR+hCwIfrcvJ9xnPdkFy8O72PEEQFPt8O2eU+theUmYoNT80n7V/tR6oKDVHKY1SktfXGb5ft53G
    5CVxR8hLOKkmHI3uyfMzms2IPK/in9d5f89/k2qkzJjNpkdmKeOrJdkaK887ByCKYktWq7ksFma9
    8pPmPbUq/h2KOVQXVKuOPYqrVedkcjitKt4kWJF/2r9dfh0U9B0BAPh+RJpKW1gA9moG0FohhMdw
    eHWwPD81BDuYzV4RwkMID4BGI0RrRZL8hdbq6Pvf9UBlOLxaDQYP1vD+buz3QqfTQaqZFXVwom8K
    WOMrn2D/luN/jn8A690EErvol9kAAAAASUVORK5CYII=` },
    { name: "23", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAMFJREFUWIXt
    0SEOwjAUxvE/ZKJiAomYmEQgKiomJpA7AIfgEByEQ3AAJGJyooIDIDgCYmLJMINspB1kY4a8X/LS
    ZG3f97KCEEIIIcR4dVODzMaGp+kWgDw/Duo3f2/YF+YokiRBa+0781HQDjAmoyhOzotxvEapEACl
    1Ov7jRUo0HoDQFmWzXrner08e3n/THujNibD2pgoylEq7ASNYe3ZO0RngCDY/STQpaoO3iHaXO/c
    W4vl/tuzk5m0uRDi/z0A4mxFdIek6MwAAAAASUVORK5CYII=` },
    { name: "24", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAATRJREFUWIXt
    lSFywzAQRb87hgEGBT6AD2AQYGBQoIMI9ggBhgE9QoGADiGoAwQW+AgCBgYCgZnZgsSKpdhOG7ed
    6YzezM561yvtt7xjA5FIJBKJ/GPoYqtIHm3O+Q4AIOXbmn2WmyzkCACV5cvUKXzrVJ7mmguhXKPB
    htzFY7N5HjelYN1DgsKG1LaGhFAEgNrWEOc754d8WBfuEeZG5r07EkJBaw3GGABAaw0AMMagKArU
    dQ0pJTjnzg914zWMMVRVicPhA0opVFV186TbbQnGSifADdUc1lov7vvei49HP7Z2OT7nuquALMsX
    Bfw01nYAkDgBafr6pwIA4HR692cgLMjyxl3bbo8sb258SJi33X5Jw93vhzexgacsbyYneyKeJb1z
    P1SYjDx9oe7XWf0viEQin2XcrxcqAbhPAAAAAElFTkSuQmCC` },
    { name: "25", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAASJJREFUWIXt
    k6Fyg0AURU87FZUr+QRkRcR+QGQFsjKiIh+AQCAjIiIqERGREUhEBR+AiEDyCREIBAK3NYEhu5th
    hhK3Z4bZ2Tdv77282QWHw+FwOBzzUbfvX7zONT8eM/K87IOMQy2CLmQTVvv9qZ+CuoXSpzIr0FhI
    F76rBcFWheFBheFB5Xlp7dFreqgX3TwIttR1TZL8kGU5RVEM+7KsSNMUKSVVVdE0DUIIfN8H4Hw+
    sV5/ArDZfBHHO6SUAKxWHwBEUcTl8jt4WwOMqevaGFHbmjWdruvounZYe5rmeudrBBDCmxSfi24O
    8GZ0vX/TWv56GRKjok8AtEsivJjmujOahBcbNb3PctbmN8mjp6SEFz+83RNnF+PpBg6H4+n8AS4J
    kwfZ+7PVAAAAAElFTkSuQmCC` },
    { name: "26", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAPRJREFUWIXt
    lD8OgjAUhz8MA4MjAwOjB2DwCAyODI4cgMGDeAAHRgcP4DE8igODA0MHkzoIjQoF+ZMYk/clJeWV
    9Pu9EgBBEAThz9FTN1hMkZ/Pl8khxgao5ZNxh4oBB6AoCvL80Khb7q20nYC2jSTJoOq+lidJRl3/
    fK5nQEtKvd8fOxOv19E3jfUSxxGA0wgQxykAvu+bYhTZpWEYmnkQ+I317XaD5y1RqiRNd5xOz5O7
    3a6tAQB0EKwAUKp8W3jdYAietzRzpUojNxdbgDn4bKKSWwNo181mk3dxv+cAztDPcKyoDfsrmDnD
    V/8DQRCEn/EAbKNXc3Rzmc0AAAAASUVORK5CYII=` },
    { name: "27", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAATFJREFUWIXt
    lCFyg0AUhr92KitWREREcIAKRI6ARHCEiAiOEFEREdEjIBA5wgrkyoqICERF5ApEBQIRvzWBFFhS
    2jTT6cx+Myv4H7z/3x32gcPhcDgc/xwzUhvk/ovml5qZxWLVNfysjQpyN9RcqRytC5bL0PaeiaIY
    ACmTut5oNafaRU9bgHoXAGy3L4PpoyjumXS1OlQYhnjejCDwW74PXXMpd6zX5wBpmqF1gefNANC6
    YD73KcuSLMuQcsd+n7e0NM2YTCYATU0pxWazosvg0f4UIYRVr6qKPH9F67eWb/cE0PpwVYAhtD5Q
    Ve8t894DYISY3iSAzRwsJ3A8RjcJANYb0Q/wePp5fhvvKSFXsWH46jcYMX1uFueh0lt+kIzS+MZg
    akKM/OjqUexwOP6cD4/aiMb8swnrAAAAAElFTkSuQmCC` },
    { name: "28", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAbdJREFUWIXt
    lqGWgkAYha97NvAARAJhwgQCkWDYQCQS5hEMhg0GgtFgMBp8BAKRSNhIJBgMROIEg4E2G5BZBDyK
    c5Sw3vQzZy73m/8MzABv/XdNWs/iAb/oqe/2NwEEW8SD3OHGQ+1p1kP8NUAVXiQXE3Rd75g0TZN1
    AYpvn2C/z5Ec8JC/twP5z1YOcl50XuL46yqgzGDbNpJDVXPNBgCkUdACMS6eydccwGUHJASAv1YW
    CdI0geO44JwjzzNZM8aqVTfkUiAMQ+i6jjRNQIgta89jEjDceLVl8tkCmJwnSBDHd5FGATyPVas7
    A1kWAZBLCJcClkV6wx1/Dd4K7hRX1OlI3Ynlct3bgdUqACE2KKW9K24H3AK4ClK3tbkH4jiE47iA
    4d4MHgrQC5JGAcIwAgAw5svNeU+wqgSqr0aYpiVM0xJsEYt6/FmhvSDTqd8MH6wPVQLDMG5PeiaA
    qpQByrIcF0BVygCc83EBTqeRAY5HNQCVP5VgixguBbKsOorPf8BB71TuwG63lYfOI1IGIIR2LiAv
    BcjzgzyERgF4d2A2m3duw6+UWC53SsexMsCY4RJCxfwLlLDUMugjmUsAAAAASUVORK5CYII=` },
    { name: "29", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAn9JREFUWIXt
    lq1X40AUxX+7p2LEiIgRERERIyoQFRERFYgKBH8AYkUFcgUCsQKJQCAQiBUIZAUSEVGBQEREjKio
    iIiIqIiIqIjIOVmRtofPktB2MVyTk8nLu/fNx30D3/hi/GgYV+2Kp4mA6vqXg3fYJY5SlC2xHIs4
    StGeg+u7jK8fUbYkNjN0zyYKEgAsWxBPcq7M/F2un01LiO6ndVLHIrqfoj0HgLuzgMHvPgC6ZxOb
    Gd6BuyLXe9bavI2XwLY1WveQssSyLYpcAJBlWU2uNcaEFEVBntdjlqWYTsO1PJ2GAhgOh5SloNOp
    CWYUaK2xLIvJxCClRCmHPM8oihkAUq6vHlosQVkK7u5uKUtBGBp830cICcD+/oA0TUnT+Nk/WZZu
    TwCA7w9QSnF42CcMw9V4mtZEjqOfkSrlbE9Ap1NgTEiep8RxitaaycQsiB3m8/kz0jwvGs3A9zFs
    fAy7XR8A17UBEKJ+ZlmGlOUq0JhJLdRSAB8ew6YCYGHHR0cn5HlCr+cxnaYIIRbCFKPRDUp1AYii
    oBFHGwGvhIThGN8fABDH01bE20AFVMGlVx1rWS3f2yZp5QMv8FaFraveRMBWsLGADhZSfqEA+bHb
    7lbApthEwFs7vvUp2MgHllh6ALT3gU85oesqjInY2+uvWvGunbB6asFQX1DiOEYIgeuqVeBodAPw
    Ushub8V/+rccnfR20o6rWXJM9DDj7+lDnfRJOx7f1BeSi8choyvzbjs+Hyh4Z4Oum4FqlhyThAl5
    mnNwGr0KWCTG7SkSk3E2zt6M8Q5coiBZfm+876rg0qvOB2pdk6kWQtfGnA9UFVx6n2pWTX/6KOZT
    5P8F/wDsV00TlKEprwAAAABJRU5ErkJggg==` },
    { name: "3", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAj5JREFUWIXd
    Vi13o0AUvfSsQCAQIyoQiBErIiIiIvkBERUVEREVKxCRFQgkIrIiAlGBQFSsWMEPQKyoiKiIrKhA
    Iioi6t4KDlM+Bhhouj2795wR3Bnm3XnvzXsD/Kcg1YUXn2CEeMCURUwV0GWk5MFcQ0nEFAFdRgRv
    XhrIn05KIrSpxs1LA4f7F+Cxtg8xtzAOoDk3GS03M9cgLFGMrvkz5YAs1loensDmBra2I/3pB+T8
    WAF9CaXl4QmGaUh/NE1zsoBRCTWbzaWbWpY9SUDV3dqzn+M1eysSDUAenoBGQh2PT8qGhgTI3D0U
    a20XJi1RAJBlL6ME9LlbxNpzVyVXEyHbtCcEVBn1iaGrFe99KS/jdt6myRMAinWd0iSiZ8Z6RNQ3
    EGNxb0s5HrDBtZvVgtIkonjvU6zrtF07FOs6AaCmCwmFW2nnbYQr7/QYs4WN38kR3/aA77uCi9wU
    bG6A/dJrfBIeBGfZHNm1i8erJa43NwAA6+YWPM/rxsvTVNz9fqIlCDZap20OHjDp2ivne68HRCK+
    Zm+yK1fUeMlVlKBrLW3XjvjYP6RinnjAiAdMnLRRy8lzV5QmkWp9J89dda0dfQuIB4y2a6dvwzEC
    WigLkSg6lRYqwvJgHmT/UkdtmNwLtErcPtQLxqDZjMqkUeoFls3PLqAmRhKWEsQDhp9xJP1xTDdU
    gezhSTxgXS+fanUchMqjtHVy4D03JMYBfN6ruJUbfeJURUxBp/sHuup5RYwU91fxpcb/LfwBfjaB
    nLuk92oAAAAASUVORK5CYII=` },
    { name: "30", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAANFJREFUWIXt
    kyESwjAQRV9vgYhAIBCISkSPUIngEAhEDoGIqOAIiIpKjoBAIhDIigoEggMwUwzdCaTAMEMx7DPZ
    TTL7f/5MQFEURfl3oo7n1+90uzJQA6TLeXBQlhV7V4j2NwwEr2wTBljPsqZ8mcCz2Nrp9wCwmeVQ
    VW+veyYAIt+AxDY0Bjd3pHYaDBgac9f7omuXA5DaqdQ2s3Iem4HUi3zF3hWSQN3Ett3sGCexDPAZ
    TZJg71idADjf1obLQy+UR78LE/gBXf88RVEURfmMK7yiOQeYB6d8AAAAAElFTkSuQmCC` },
    { name: "31", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAxVJREFUWIXV
    lyFw4zgUhr/eCAgYGAgECBgsKChYcMDAICBgQUBBgcGBwoIDAQUFBw8cWFBQULggwKDgwIKCgAAD
    gwUBBQUBAgYBAQYGAZ7RAidK3E03drYF+2Y8nifJ7//99Os9G35zs78a4I9fAf9XiDchcRT4Fdi5
    UvaqJnA0iWMyYId3I9T5B5b/9VHnHzi7vuBYEvsI2AMXWToDYD6r74t82frZlyZegqu4Txh9bAwa
    k/MpCp3/JfnK6vIKJvfMBkNIZwzvRpxqDcBjmhEEuhEjS2csk6kFTnbHG87OWyCiM3ytHJksnRFG
    H8nSGZfxkOc85zGZ8Cke/DC/+0yRL6nSp1fx9hFoENmYivsALvip1tx+/sLo+pLnPH8N8CDOzwg4
    ImMpMVVFVlU1UNynpxXJn4r425JFvmT0kJJVFbGUAPy1WrWKf+gU2LGUaCm50ZpYSmIpCZMpQaCZ
    P30jCDRhMnXgca8HwLgmcvBkHGJoqyBwTi8M3D4DjB5Sbi+ixp4vMuPWC2PaYPycwNT37VwpO5bS
    nl1f2L7AXVPfb/jDu5EdS2nnStmp77cqUK00MPV90rIEYELlJiY6YJAb5w/WpzryPPpF0Sp+q0oY
    +T6R5zXGBgjSonCgbq3nEfl+m7DAj4Von50IY7ZaWGfiRmt6YcDD48yNbcC77H0bAgCkRYEWghut
    MWXpBHkBZJMn8qpCizorXax1M0qKgrza7n+xrv+buxaCvKpI3ovAxkxZkpUlp+Epj8kEXyuysiR4
    oZF3IwBg1pnY9AGzk5mu1lYDJ/dgKQpi329sBeD8pCi4X69vS6BzBvK6xvOcPQNbDRxrnQhoIUhX
    KyIpGxqIpORvY9Ci9aE6jkDwAmCjgdfm35wAQLRut23H35xA6HmEnsfN3VcAbv/PAIh7PdeK341A
    sloxWm5FZ0zuwJPFgvO6BHeyLr168yNCVlXcqroAbYgBhELwT30kW8ftpJpdke1mIhRiO9exKHWW
    beh5UJZHKX6fddJA6HlkZVmTgIbowiN7QdfvNTtXau9EVpatv4R37TtCe12tc/ycRwAAAABJRU5E
    rkJggg==` },
    { name: "32", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA2JJREFUWIW1
    ly2U4kgUhT/2IFaMQESMKFFiRAQCMSICgUAgEIiICMSKFQgEImLEiBUtWkQgEC1HICIQCAQC0SKi
    RIsIRESLiBItIhAtOYcV+TnQTW8SevadE0Hlpe7N4777KvD5OGXXTfHHZ8ENp8dwMcuJ1I7mZ8Az
    YFQQluYCjWs3bq3AyV17OFavEvhyuctJ/DYC2ImCXy5Wt/Of4EpFjMd9SCvwjsTNBJ7D9M03ns9B
    Jx+CPz9rXNeDDypRh0Cu9lPbtfHNIePNK01hANDsti9yRqMJr6+a+/CBTqeDUhGed/du06oETm3X
    xl17HKUkXD0BMHQdAAZOn4HT57HVou3aANi2zWz7wKBr8e2bYDKZEIaP8EaMV5V5DfyHM8ZXjwCs
    vTUjd3SRFMeacPXEn+ILAKZl8qMzIQxDdrvNVfCqBCD737Iys9tr+m3BzP0LgEhrtv6uWK8KDuU+
    UPRv27WRUhDHGva6AM7fviUM2GtMy2SARfilHLyMwGm4mLGZzk85OECkoiIhjvW7hyIVgQUvfkJS
    Ag4lIoxjzfJpDcDW3xXrvcOBf1SElAIpBc58zUEnTP/uY1omLzoh8cvBqySc3LWXEggUkYo4BnsA
    7pqXxft5PAJgOL3K4FBhFkRa41g95urXxbqaTy8Tp/Pa4FDuA43NdA6kbTVw+gAMFzNMkWrCFIKt
    v2O4mH3kiJ8iANAYfx8RqQjH6oH8ytbfsQ3URVIcpx3wfxAAaByDPff+kuXqAdMykVIURFrCIMpE
    aTg9qHE2qDMLGntvxb2/LFrxqBMGXYuDTjjeUP66BC5CBSFtu1tUoCkMNp5fNp5vJlCUVErBUScF
    kJSCg04YOP2CxO8mkHvBiawr8ikIqUHl4stJ1InSWWA4vcLz899xrAtrPgZ7Xs5AW8KgjhpKK7Da
    hpgiVXfbtfl6BhapCMPpYXU7vOgEKUVtIyq14uFidjF0ig4I9uT3zry/FjhUsOKf3yfc8YAKwrTd
    sllwTihbqwWcR6UuUEGI1e2kMz+NBpkgW8I4Pw/WjsofJtdmP1Bo4jYbqjCMrKzFctW/DSkFVrdT
    24KrEijCFClQduotgPIvo1tJVD6U5iM40po41uy9Vf78KW/FPLIRXmnvOsotPkZNIfBG7vnzb9+6
    8r7/Ap+/mso3Jb36AAAAAElFTkSuQmCC` },
    { name: "33", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAbFJREFUWIXt
    laFWhEAUhj88PsIGAoFgIBgMhg0Gg8FAMGwgbPABDBMIBh/AQCDwAAYDwWDYYDQQCIYNhg0GAsFg
    MBj3HAzACDjAcXUp8p/DgTuHf/7/3rkzAyNGjPjv0AbSydr0hzCQrU0TgOs0BeDSMADYTZJBKiAN
    RO/v+fvjg6v1mnL8T8VUjx0I1ThAtkkF2tYTOxCdxMWFD42+2/mpuB2IXMjU5fv26R5MnYUXdpIL
    g7UEfl2BvqxVqFaiz8CPym0ZBgfGnoyF5zM9OsAqut4T3tfPySuAttslagdCTnourrCm1lcWXojr
    uzJ+iGKSJOWBWI7pxgSgZkrC1CF5rTVhBrDvzrh05nJwmb4oJ1mmL6yKfV1mqIJSHJgfnkHlIMrs
    QOBMjwnjx9bJmiiFfe+GU+fk2xI0DauWQCvFAeJoyVuYG7ADQZKktWpch7cyLjJg353xfBflHNfp
    5FR5NJqw2mwakGHqAEwq6/4Wr2RcGNVq3B5Og0ftQ4HWHdDB7eP0aY4YMTw2vgv+Slt1Dkg47mJr
    6qFnQ3EZZdsU6kNrBbZlqshcav/mJNwUNc1PG1Cld7ktMswAAAAASUVORK5CYII=` },
    { name: "34", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAf1JREFUWIXt
    li132zAUhp/s+AcMGBQYFAwEFBQMBAQMDAwYBAQYBAQWFBgIDg4UCBgEDA4YGBQYBAQUBAQYBAwU
    GBYIFAT0B+QcDSTSseOP1ltzRvwiK9ar515dXTnQq1evXr3OK33yrE8nfDgjVItUWrBIJYXx2QIo
    QpETQbxN4fKCXClypSqGwb8CC2vYzOJtymx6g4iEhQ49z5rkRFh21wAMZADoeJsy+zxphJ6CizJB
    OB2gFsLTs463KUm2xg2+EImQJFu3QlebjDzLK7+/tgPaQK+mYwAe5X274/LCPopIWDhQCmC/eQQY
    NAWg4ZBxkq1ZygSengHwF2Hz+Aj3RdC49QC5Uixvo9oALNhknWc5e7UrTTKZyVDieC6hmNuxeZcr
    xVImOJ57yFjtcEdDXo5r1e2AdsZX/Ip+kGRrVskDH4/mJu2yHF8EQLnu196nRs9dEpsyVrpA+4uQ
    bPObF7XjW/C1svCpZCgBcEdD5oHfGqydfyid5doe9hehqYuVvwgZel4po9n0Bsdz2asd8f1P24Z/
    4RkAmDYcLG+j4qUCoFfJA9mxDKPxtX1hzsQ8/F5J5DVPsV1LW9GgysejRrUHuaOn1/9TWy3aatl6
    g3bhlk59cUYglo3uRNb3fJunxl+6iPRbze8lE8S77UDH7OENf0i6noHO9Qf4A/0m8acl2cwwAAAA
    AElFTkSuQmCC` },
    { name: "35", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAkdJREFUWIXl
    liF34kAUhb/s6U9AVEQgKhAIZASiAoGIqEBEVKysWBExP2LFCASisiICgYioQCIiIhAVCMQKRMQK
    xP6APWdWpDOdJIQ2EDB7z4EZHuHdm/fumwD/EdSh4Ldrkfuz8KCIawmoxdUE9Fz3WlQVKH8WKrq3
    +avUhptLEgMOQODdg8iDrz+mF6S0yEUsFe93L2JZW4GLiojWsaJ7q0QslT8L81bkAi4qQic3d1+u
    gCWk9SlQIpYA6mbYL3zhi4CO18OfhdoHjnlrW0S0jnnLfrHNssL4TeULAH+TjQ45bQnQjlf+LCRN
    3mov3Kdb2P22K3E+uXa82b8br261PdDGOeDIB6FELFkmKdssA6hddRs0mpqwPELms3zIT5rdLju6
    joMR42D0ob4BMX0xodt1Te9ELJGhBHKXH0OdGT8TYIjHQ49lkrKRC1u4HjtkKBFTcTTZwL0DKEzI
    MQHqAHEFneAeAG84AOqfepoc4HHyZPZ1Aj5MlW7N3Nol1yjf9cC943HyVIjrWLR4rhCVBSiAaB3z
    cx4BsFkktYRT+UIovheI5umK3S5js0gQU1GJRYvnQgXsMTT91OQAN26n4Fp7jOw4FEvbnwxrY3Yl
    KmZaJinjoQdQKHfH65n9n2zPOBjRc91Cb7+KeboC8v8GRoA2E8B+vvpSIvs3TWDlLzwL7AOm0flw
    Ai7xEDwNbSg5pQpOZVOT7OhBBRCI18bsc+kfJFDlZPaFZZxCfAhmCtpKeKoAaNjLcwXr6p5jwsYe
    KLXUAfgHdBA4vOM+XAAAAAAASUVORK5CYII=` },
    { name: "36", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAxRJREFUWIW9
    lyGQo0gYhb9cIUasQES2QKxAICJORCAiEBERJyIQI0asXBEROeLEiBMIRMSKFREjECMQiIiICARi
    RQQCEYFocQIxYsSKVPWJCV1kZvYGyO6+qq4Q6P7f4++/ed0D+kE1rgc9YwDwRx/y2WqB4TrMVouX
    Yn6LALJ0z9T3sIXAWc4vEtFHwKCKdthCUEiJZV0molcGAAopAfCLhCIr+obpXwObaEtZSrgJepN3
    EaDq5iznlKXEHtv8Kyv28oAphgz9SbNfa7RZQspZzpm6Y0biIwB7eaCQElsIwmCNKYaM3dFzRoA8
    eGgb+91OarZaYAvxiryGLQSbNMOyhL5XlrK1iFYZABj6E8buiE20BcAUQwDG7ogs3fMoK+yxXRO3
    jd1OQJ2FdZRo0peoRRzTvDU5vF+E6v5bzCbaUkhJFe30A1uIH486jX2jdRKglnHAIghZh3c69TXq
    OkiCiCSIAJj6nh7redfkucR158RxxnIZ1KLO8G4RAtSrYB0lVNHurB6mvkcSRHgfn8lHoxE3Nz6H
    gyRNUwD2+z3b7f2bfG3nSjnLua705HPIzjQJJz5H74rvcUUY/sPhIKmqirBYY1mC5HPYh+vHIob+
    RN1/i9VstVA701RxnKk8l+r29ovyvGvledfvznlv8tvbLyrPpcpzqWarhYrjTN1fXanZaqEM11F3
    hqHuDOOnE5+Rf/2aqDjO1J1hqJ1pKsN1lOE6OiN9BLTyAssSZNmeoih48ie4Hz7oZ1Pfe7VCusBo
    0Wfw6dNMv9XONPWD7/KJv07Xbn3/8bGTgLZuODg10qenM8JNtOXvrCDtSNwHCtBzfrQsdbQstTNN
    /dunBlp/B05+r32gLCX5Q8qRKwCMsuwa83lcW/KmATWLbjT/s5P/v0SrGmjacJPcmbsX7Qe7oN6O
    6Q8PjXqo//cJ3GUVvHrbk/cz9T0M16mF/hIBZ2gQ6ilpWvGvEjA4pjllKfWuGJ6zUG9Gl3HQ+ZDS
    OQO1JTdOROTBA2Up9Umpy5mxz9JRNXHD8wdvEF7s//8r4iTkYvv9D6Wsmt5psZwsAAAAAElFTkSu
    QmCC` },
    { name: "37", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAutJREFUWIXF
    ly9w4lAQxn/cIBAREQhEREREREUEoqICgUBURCBOIJAnECcqEIiKigokouIEIhIRgUAgECcQFRGI
    JyIiIiIiEBGIzrwTaVLaOf4kcHM7k5kkL2+/L7v7bTbwn61SYo+8go/cvhUFt3UFf7NmNZ9i60pG
    aP/4pyb9zVrauiIBuZpPJSBVtSF/tjWpqo3CJIpGgDAQuEGSX1tWi0lPQVO3jNrJkZ3XIVBp3fdZ
    zafvZHyCQBBFEdbtLYZpFiZQLbwDaN33ATBqAgBPVIF1GVeFCcj6DwWAYZze2LVirGoNT1SZGQk1
    u8rOfTtbKaVlOO4qeDuThSaIvTT3xn09f2gb7vLz+CU5iFUqBeOugmGa3Ok6i1fxac3/FdOsd/Dj
    RXoj4CB4aQKGafI4V3gZkL99Bt5vDanX69zEFmEYsgyco76KpkC6oya+EGnh6QZd62Px9+47AHEc
    p+BL5yRGERnKdruHG7bZKAMAOp0OM9fHFyIH/gJ+0ooQqCyXDmEYArCppq/uJFseXhNmrg9AGIb0
    FI+pfcPUvoETnbFoDVSWS0e22z2CQAB30EgXnGhLOwxpRnPEUReXEchJAGi6AUCtUWXHG0vfQXsr
    5rKUCgD6/SFhkIZda6r481QBwNcauFoRHrT9pvPFTqqsNAFbW+YpSKKDBE5aGQJ5LwDoJSpdX2Gs
    KUxXz4WdlaqB6F2KAM5my7ibfqDcXhPbKUaidBHu26c5IMjPzuqyZVJQ+TGNUBQlV0HWhHwhcEfN
    7LmzRrNLJlrpTEYo0QL76ZXejYplvgFpRHwheJgd/gxndhUZQloLD7MET1TxhcAwzSwaV23Fx6zy
    TkSCCoizZsSLIqDpRi7HfSLOZnu2j1J9AJCDwRMAQWNYwsWHFR5KM80TPQMTJpMRpOHPcz0YPGGo
    7t+icxEBCWSVDYD/aH5ay8AtyyKp3RJs18DoqNPCI9kRPzLrAbH+iOd5WXSO4lz0Z3sGsZNYfwCa
    GzfoYp4UewAAAABJRU5ErkJggg==` },
    { name: "38", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAjFJREFUWIXt
    liGTm0AYhp+biViBQERUICIiTiAiIhARiMoVyIoKREVFRUVExcn8gBP3AyIqTpyIWFFRgUAgIiIQ
    ESciECciEBGIzFBB4SDAlUy563Qm70wmA/vtPu++u7DARf0r/f3rpKu+4atFCIBzY3ZiDl4DnuuT
    7gIg53MM0wBg6uhp2URfBgr40zYq4J+Xt0VBFEaFibL6WIJ0tQgLMMBa3SPnc4AadOroFe7fGmiE
    l2eeKwqjfF+8zh5Yq3uAGrwErsHPMdD6WIVPNjsla+sNvAj+Y0MZuvgyBCAID2jTBwDMxM3+33kA
    bH8GHM1vReebu30nzmlDAXUdDYCxIVD+AYDR+4eiUDx+AMCZBqzWFgC6Vg10qA9OzdSMlG+knloW
    F7Z0AbAmAjnLzCj/wFCHfQyWKQjCpKi/Hg3Yx8faDMdGVidnWm6kYqI1AXiOPk/AMgVDfUAQHhgb
    opjlPj4WZoLNsylpZzX7ODO43R3z9sbHsJKA/2NeWUdpC+RMR/kxY0NwPRJsdwnx4Yhlamx3Cbff
    49qY5f77mFoS5UW7sqV7utuvgFTaAsvUUH6M8hJcJ+sWH44sV1k6eSIN/bMUvSSVtuAxSrAmgmCT
    VF7JLyn11DI/4XKD6dePeuX6pK51LGsiUmmLzidm26BN97sYAEhdRzvryG4qbDXWZbyNr84ycI6x
    Tv36MnA2uAne9xdRG5iNrwCYzORbcTO4p5blWb957PxL8EUXXfR/6Be3UA1Y3A33UAAAAABJRU5E
    rkJggg==` },
    { name: "39", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA0ZJREFUWIW1
    ly2Q4lgUhT+2IhAREYgWiIiIFgjECEREixYIRAtECwRixAoEArGixYgWK1a0QIyMQCBaICIiEAhE
    xIgWLSIiIiIQiIiIiFf1RkACDEn4afZWURV4N+ecd+59P0B+yILfv5p7FH/lAS5s61xg2RkP09yr
    hOQJqDx0+lwgAsVssCfkywIAeJ9YF4kIgvBqEUUhF7YlB88PZfbKxqgr45Up0e+k9dSQitm4qByF
    DsDGhW6vz7//9CgDVVs+i+63cznPFlAZTxe8TyyAvHJIAM/1aHRNAj9AN/TNiH6Xjp90QykZkwvb
    wl3OaZmPzKbDg7GfL3cAeEHI2IXvgPHh0B4NcKZzxr1d8t+vKwlU8khOliAlF6JJq1k9IAeIYsGP
    5oofzdXBu2+TNV6QALDNz3WizIHKeLqQdb2OEE1+eS4A97qCZUdEkaDVrGLUqwBM7Ail+3QA4H4m
    +GGCvUjgCgfkwrYIgzAj75gqbVMligSapuB+JBm5MRqg63Wc6Rwj9Gg1q9S0EvR0lifGM9v6Tyqa
    qlDTFNaRwFnG9Doa7v2m2M50Tvv5EWc651vsE0UCQ1fwA4EXiEKuUwIOxKQiolhgzWIaoy6e6wFk
    5Ebo4QWCe31X3V5H42W8zuUrbcI/xVqzmCgWaOoG/PO/9yNyY0u8nTVtUy0FLWvCIhFZWRqj7kHd
    Df0QztB3JSuKSxzIRGw/6L9seP+JEXoHM+0/bZ79QLCOBH6Y3FQAgBz2NDqmhr+1OooFRr1Kq6Fm
    S7NtqjjLmFajuAzXCqCmbezebk658TaJbt4DAHKf1P1I8AJB28yFqrxNorRnLt+Ki2LwfXRU1yje
    NZofJkzGL7DZR7KeuZkAgMfHIe5nnH23ZpvndSRKu/4mAsIwAHb2s53hvgtpzq0FyGFPQ1PmhGFA
    //n5KMEPE8xWFxE7ZwFe04QAiNgptHoV2tkqORVXlSCt8x+NWLFm8dnEXxJQFvtH9P8qoOiike5+
    bVNNt+TSO+HFApxlXLrMolhkh1K6Jd9KgHwd1Oh1NJxlXJRz1AevgxqUuHCuALkFymZfcs+rWLMY
    P0xOnoRFALnkKfGpS+b+exfylIMNe5rsPFSv/hdcFL8B812fe6FMffUAAAAASUVORK5CYII=` },
    { name: "4", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAepJREFUWIXt
    lCFv40AUhL9ICw4UGhQsMCgIMCgMCAgoKDA4EGCYHxBgYFh4MMAgPyDggEHBAQODgoAAg4KAAIMC
    gwUFAQUBAZHeAceW7Uuvie501UkeaeWVd96b0fN4oUOHDh0+Gb0L+fK3+55LFADLG3GtLWxb09e6
    OsyMASDPDa9myzZant3/I4IAuHOfvtZkxpDnhdhm9og79wGIpyFOMMa2C1OludnX4EOt3xmQunAS
    PXFYbdq10t6roQPAvXdXGcmMIZ6GJzVPGRCA788/iNJlvbDNl1grAFxzqJ9VObG8ERPPrQqSVcpm
    9tjo1WhYF85zU5LbnB4giaO48W3M4pVdvq+baAS1NHGrb1ibl1+MVK7duY83GBGlS9LVuh6kCu7c
    J56GxFpxZX9BWcUE3p537MwB78hJV2sGw1ugCGaWZgAswm+szQuLKK4mo8rm8SyiH2qS6Kl4YV83
    xK1BvwoggLIUh+2B/du+wctzwzbNiI+iAEpb3Ht3TPwHAPxgQjhbtDOFAOIEYyn37ywovr8kjpJY
    K4laZ/VleSNRQ0ecYCzu3Bc1dOQ4cQHkvRCecz9IdNx4xaNdI/Vfs/UXlVnpXXoTnjJ7Ury8I8oM
    HMX/VO8iiBOMq5H/S+GGic8U79ChQ4f/Az8Bo7TlwmYCcMsAAAAASUVORK5CYII=` },
    { name: "40", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAhxJREFUWIXt
    lS132zAUhp/sCAgYCAgEGBgYGAQYBgQOFAzsBxQUDBQMFAYEFgwWBBQWFAwOBBQMFBgYFAQEBAQE
    GAwICBgE5BwPOFI+mqxNGrTjF1m+9+o+en1tQ6NGjRo1Ol7VOTf7dGzz2SQ/O8SxqmaTvFpBfBik
    dSrE/aANwPXtn4/ss1X47tPcXKqt9d2jPRnCFVXPowcAivnMB8MoJoySusltHyHGACSRBGA6X+xC
    7O77bgD4hwPdtG6oFRgLSSRWAMu9+fnYg70JciihuvoaAKACQRJJHkaWbkf60zsZu0SrGsjlaCXI
    JyWj57dB9jrgnvFus00IZ7/L2QUcZZY4rGEGQ3MQws/AOBthrfGByfiFsrSvCoJAoZQijGIAfv28
    4Skr6abSNxxlFq0E3U7gYQ65IdzNtPel+tG/9IFu7/M+YK88++2vlRKoQGzF3drB3A/aTOcL7h6t
    c7q15YBLsGU9WIcGbFfWLrno1SdNIumtB5gVC7QS3hkHFIfSv7otoLr9rjG2bqiV8Nd7G5ZLrr4N
    6Q+u6XYkT1nJRS/wg6dXbrj1ZvPd9WBo1g602zFxnGJM4WdBKY21BqU0WocYU6xOvZ4VV+PuK6V9
    bLNm7dhGzuLFzwBxnKJ1HZBSIoREysBvpLXGmAKtQ4JAEYYReb6egyRJKYq5r6nr1jXGFCRJynQ6
    RusQgCzLT/sUn1En/0MaNfp/9Bfy5N5lbEEB+QAAAABJRU5ErkJggg==` },
    { name: "41", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAeVJREFUWIXt
    lKFzo0AUxn+5QSAiVqyIqEBEREREVFRU5A9A9A+IqKyoqKyIjDh54kTlicoTFYjKE4iIighEBAJR
    EYFYgUDsDCdgN1DSSztT2hN8Mwzssrvf975970GPHj16fDEGHZ9fHOPqUkCxupZ2sPyZHuTsVMDd
    ctSavFrtGtydCrhZCACkcJDCASBVGrCODDrPgcuLIQBiWAqYeG5DRNcCoEpEf+7aieBPbj47d6Ah
    5Gy2F7He5ACDb+895MDzpn3+3EUKkALOpnshzjuIqSeVeV+tdgWvJ7PdN/FcglAxPnFZR/YKOOZA
    YdRPPIfHMGv8TJWmsvWQM4U/d7lbjoifc5t4sLcf/u2AbSSp0oxPmsQmCimg3nDWUYZ/XjoVhMoS
    l2c0o68LaN3l6loihcM2MUT7Wv4VKKC8y3p08XO5dpvkSOGQqiZxFbmN3ggoNmGAUinR5gmALCsJ
    lIZRFflwKJjMThFCsk0WrKMclWmkcFCZtnVuxgY/7lU9rlaumIni++3CEgFMZ6d2UbR5sqIeHn9z
    6QtSpbkPFDeL0v4gVMSJboxr9X5UANSuoV6vL2FsB4gTzdgrrQbYqTFTLyZV5fdLJEnU4m4I8Lzp
    q8QfjUpMqxO+tbF8BD6zC/fo8R/jLwu01GdQT1BeAAAAAElFTkSuQmCC` },
    { name: "42", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA5VJREFUWIXF
    lyuQ4koUhj9uRURERESMQCAiEAjECMQIxAoEAoEYgRiBGIEYgRiBWBFxxYgViBErEAgEAoFArEAg
    IkZEREQgIiIQiIgIBFVZ0aR5bODy2rp/VReQnMef/3SfQ+B/RuZKv/gOMa52jt8aOoausAzX/OiH
    N5H455LEQNy1WgAYuoKhK4f3704gTpYzGwMw9/oA9MYh41kk7TbEEvuzcUq62JmN6X02AMjnVKLJ
    iiAvbqoOVCpPjBYzAKlG9blH8an6X7EljikQvzV07EmTfE4ln1MBCPKQ9fYNJ7NIJjd0RRI+F2kE
    pNwAnr/6wyDriacHaBoa/XEo7yVk2SnfwdqDcngBoPfZkIHyOXWPxKEKU20FS/HddsWe6Hc7AFTq
    za3f3MV1bBotK2anPMfqFJeK6h8XSwVxLeuBommYZo6Z7TJVBMFWsy1tK/WmTFoolgD43mkzmnp7
    edMIxC81DV0T4oTRWnxOI3RNoWg+YJo5PMclXywwnNgAfHt/ZzD8QNcKtN+/4zo2v379kEHDMEu9
    Xgeg0bJk7kMCcddqMff6sgSev0qaDdWyuFaOVBRNQ9d1huFcOlvWkMl4gOt6hJELwHO9nSTcxWkF
    ulaLcDGQu9vzV/jj8KgCb4MRrmNjz2Z8eTaGDuPp3uY9eiRTCbw1dGDb7Tx/xTzYBtxVQPlWk4lt
    57yk5xhJEkkpbDeiEAhFHstP6LVXXMdmMPyQTpunvmgunOyEydBJoGgVKtVnKXdu7ohjeGXyUw7x
    v++io2WzOXmMfnY/8Bdi15cjFXcRsTSVmwikNiKAB89hkS8SBL5YfiCTJ0iS34K0CHGvVuBl5ALi
    KCXHL4GZVXGnEZgKc399E4HDWRBP29VNciHnS01j7q9ZhsgVTiN4VJn7a0pFlUF/dDcCqRj0Rxj6
    9ncvEE9dKqrk8zVm08ndCGTKH2N6tQJsJtfj4wuz6YSnUh1DRxLRNQVdU/C8EVEUci3SFMjsluDr
    q0cUhSwCMaIPOhwAnnf/EmTYDCVAJk+DmVXpjSJJ+F4EzsZui/7rBHabTTIhb8U1CsSfnQdADKuD
    AXRfAromEky2f78BMq/WAqtlMA9WlIoqG0JXvRccnQVWywBgGa4lAU90vcQnrpZVOazMrEqnuzwV
    82wCsdUy5KtXQuLIK1j82XmQdsDFJFKnyTJcy6A7my0taObVWsQAyf+HS3G0BGfYHPO5qAS/AcZO
    ncq5P1tTAAAAAElFTkSuQmCC` },
    { name: "43", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA0FJREFUWIXd
    li90o0oUxn/sQSAQI5AViIiIioqKCERkBKJixRMRERUREZUrIitXrEBUVEZUVDyBiHgiAoFYgUBE
    RERUPIFAIBCcwwoyEwj5Q7e7K/Y7h3OSYZjvm/vNvXfgL0G5e+r/O+HTryCPAh/vcaaE1H7/dpRR
    4Jfe46wegTIK/GMROSroZyNQ7ojUgDs0YL/7xlx3aDQi9FEBivhl8QTA4vUZ1xEMbgyc4agx13uc
    sdkWXN/c0rd1JnemFAKA/l5ySewODfIs4J/xkoexBcD48z3z+WcAHsai8eGV3Qfg9nZCkj7jr/IS
    0LT3kEeBz43j8jAW9G0DgDDOCKO8NXnkmGzeqvHNtgDgyXtmOrsHYF2NdRJQAhpQfpm6mHpIkhb0
    bYP1dk+cZhVJGOX07CqwvSuDzVuuBAD4fsDy3wWzuddJgNq1OzToXRnqhVx47AosoTciIYSOtXMg
    ScESVRSkMH+Vs9sUFwV8mbrE6/8a5GFcEaVp0fpACL1lyS5DWuSXBJSTO5PelUGSFiyDTPlaD6kQ
    ekOM9PZwrdrvxrtOabh5q3xdBhn+au+xhAy3FHMEWu1p4KwAYdYO07aQu1N+9mydvq2TpBX54Nqo
    53mn3nBWwDLICOOsMeYODUaOqURJDK4NJXpyZ6rKyL5wvb8UjxyTb96KMM7x/aCVCSPHJIxy+rau
    0lCKsITO4MZg4c1Z+i8nOc5WQlls0rTAdZ2W92lW2bLeZrVvdITQcR0TYRa8vH5tnfw6zkVAmz7+
    j+s6zO6nijyMc8I4ZzJdkOzTUB2wkWNiCUjSQqXrOVzKAm29LWTVIkkrr5+8V6Cd0wBWLRMscXxO
    HV2akQaUktwwHeIo5HvoHc5Th0yW4Evk8I52PLg26NsGtvWdOI4Ow1suvDmAsiVJu63bRUC5y22S
    tGC9zcmz4OhEWXI3b7lKy18hQEHuLoxzWe9VeKUlsgV3xcVmNLkzVUWUBCe8LYFWrfi2SM/yXIzA
    IfkZbzVA81d5Iwq7m9HJUtz5SrYMsnqrPRc5rbpuNaz4qTRUh0+iA/lFwkN0bscn+vyHcUpAWb/V
    1g/VnxBQHl6pL53kj6CVSn+S/NTCSsTvJgf4AYj8ly3+4cFkAAAAAElFTkSuQmCC` },
    { name: "44", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA1VJREFUWIXl
    lx+U61oUxn99K1AIBAIDhUKgUCgMBAoDDwqFYCBQGBgoFC4MDAwUChcGBgoXBgoDA4FA4cFAoXCh
    UCgUBgYuBA4EClkrF5Jzbtom/TN9j96WnJWcc77vfHufvXfg/26VC9cnl+731yXgt5ZO/P7Cejzg
    1tKLCP2nBGgYGgD1RkuNd0ke26Nw1Tk2C974WH8Ugi9mAa12N+GAa76qQAKwrMWENWh3/mZZi/Pf
    JDiHwI9+LAMfeAamobH+3GDoqYgiiglFjP84BkC76Z20/7kKJMO+SaNeJRQxVq1aCP7jn3t6zmlB
    eY4CSc/RsZu6ejFfRmo8+PaK6zk4us4vK2b1kbpkvtgcxDnXBUmjrjHwzK2XducHruek41ZVgdvN
    VKGniSjF+hIBaT3XpVarM/w+wusarD83QHpqu5WCyxgpI3G2CwxdYzqL6Lkuna6rTl5keRJlBE7N
    A0nP0aU/Ffjjw7fCyUaWlKQSIooL551DAEPX6LkugAL331c06hqGoWEaf+aGAkwD5ouY1YcK1LNj
    QF2hgWfw/fYJgNflmre3N/z3lVyfSKnzJMxMhRc/OohT9iGZPD/QbNlMg1dEELAyryRofm0iFRBi
    X2arrhG8H76GRS5I7u+6PN+PABhPfR7nP7Ht6/ypIUtKoYiZzlKZ7VZVJSfYzhOnEkieh30mozSj
    XV1b3HUcxlN/N68nw76JaWiEIqbT1lValtKHBYocI5AsZgF3HUeB//q5BmC5mG+RzIMDrD83WLWq
    Ag9mAqtWPSo/bNeCSqvdZR7FOH1XgV9dW3j9odwoyXL8FngGpAjYTV0lpWO2V4wWs4D70QSAG6+z
    6/ctoFDEe+ChiE+Wv4hAJfM146nPaBzsgleya6Wse/Mn6ApU+VI5ruSIFG4go1tEaUnu3lSV5PI5
    8Aw4oRwf6gfK2Fde/GhP5hc/UjfBbuqYhsawbx4l8dWWrJIVl608v+se09Cki0pJXNIVKyVyTUrl
    aSL21DnUHV3UlpcRkyTmywi7qW9lx3+dgN3UCUW8e0rlIhmUZfFw0Z9RFumlNl9smC82yiVFrjj3
    x0QtHj9cEYpYnXAnABOATltHRGmx6rT1vSCFM1syOZDpuACY/Bzp+1DEsiXbw/4NI5eOiDlYjroA
    AAAASUVORK5CYII=` },
    { name: "45", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAutJREFUWIXt
    l6Fv20AUxn/ZqirAqqzJwJqiKcAgoOA0BQQUBBgaFAQEFAwMDAwUBAwODAzkDygoGCgoCAgImqyq
    ICAg4EA0HYiqAGsKMAg4TVYVKQNOrLTLlnOyFe2TLJ39Tu/77r13d8/wH/tjsXx2QmFf8nL5GIDJ
    ZLSTv2f7kocffGazGNt2YYdI7CpgASDECeWK4KM4+MX2LwUsGr4PgJR9JkpyK6PMuLQZi8grICNf
    oXfdAcC2HZqtXm4RB9unbEbD9xFIbocx1apDUXzmWL4BQCKM/eSJwKLh+0RaU503M6Li2x4j8YWA
    VjbxVES/87GXAABKlsXw4DoTkVwGD8jjOGEiY86FBQZpyJWCSOtMxHR2jhUnVIMSExkDMFYzbKdI
    WTggY0Bv9Wkq4EHxCSTxmtF2i+lAGXpbQ64URFpTigcAyFG6ulAHtPs2s2kCwMgSDMOIOE7+roBI
    a0qWRdUvYbtF5tVaKkT2EeKEy7HLZDoHwHGKxosyroGSZT14n4+GKMBFISXUaj6DAXikhZiK2F4D
    uSIAMJtq5hEENZuzU5f37zzqc8VgECLECQBl26bZODPyayygZFlM9ZK82ci+D8OI5rmgPldI2cdy
    jvG8sqlbnhvMyXaAvr/n2/yIroyovvoBwM1NTOX4iBfOIYd3E5KXr/l6953WRQcMrufcKXiMqVfL
    xl7FRmuN45ofxUZFuNoB0zURoQ4AEEFAZ9zD8zxuVchweIXvm+Uf9mhIPM/D87xsDFCvp6kKwysw
    7I6MIvB4C7qWRUQle18fL2HcmuWOgGtZdMKQZNwjEOmBI3ufKKFIxr287vJdRv3BYDUsdLsXC4Ci
    F2T2bvcCcjamu9RARtBopOdBpWJe9Y9hEoFCJwxX9/rG1Skls0LMC9MIFDaRdzqdnUh3EbARSkkg
    TcF4PH5SAYtWq02lIrhuBygl0VrTarXhKf4LfP8MKWW2A5RaNilSrk5BYxG7/huuExT+8G0rfgKy
    pxQfImEfDAAAAABJRU5ErkJggg==` },
    { name: "46", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAwlJREFUWIXV
    lyGQGksQhj9enVixAoFAjECMWIFYgTiBQJyIQERERDxx4sSJExErIk5GIiJOIE5EREScQJx4ArEC
    gTiBiFgxAjFixQgEYkSqJgLYsHcLDEeSqtdVVLFM999//z3dAPzPza1fr7Z/Tkn+eNXlc09siPxV
    Am7QqRN1OkjZYtCpn0TitebSpO8+tusnteE1Crh1cpaLBQAf24UCRxOpHZt8NJrSzr8BMLr/AkAU
    twG4N21Go+FRuMcQcLe3Q8IwQGuNCWKy8aA4vLlJmM1mANzd3XpjH9WCVktgjCEIAgQZ0UVSJM+y
    jCBYkTvGzjz93Nu318WDMYZut0sEXESr5MYYlFJcXl5ijGEyeXB4qOBLgH6/z3B4h9YKgO/fV3L/
    +GE5OwvQWiFlzHw+xdqlL6x/CxqNBgB5rmg2BbJ3g5QRURQXPpPJA2maIUSLZlOCx1T4KOA6nTeM
    x+OieqC4gHle7rlSMyBGypg8VxwyLwV6vYt1shWgtZZWKyrOz88vivd5rhBC+MD6E0jTMR/apnhu
    NATzeVZUP52OkfJXK/4Nn9ZKHDafWXVq+AF5/Xnj7+K4R7//HmuXBEGItUu+fh1uFKpVxJxG4Jmv
    S5JBkTgIQmCl0mTyUPLzyXGoBU7dSw+O1ctnHbt3El79e2CxMFhrWSwMIDDmJYlQhgdxDhKoAKkN
    Bgn1ukVrTZZlaD0ny6ZQlrvW7M3I0xj2qLCPgFP3kmZvtlPK2WyCEII0fdwbv4/ELgIuT2Pk1epW
    yytVQULw7t0lQrRKI7idfB3PUu1ezVUEDla+MWPMrqPt1tXkldqpwt47sBVIlQrW2qqwogA2O2FP
    Qc8JlKQHyB/zUiWbz5XKANB6/oLBVvXbrahU4jmB2hbzFVhUmoLKpbIaxd0Y+86qWlAape2qt23z
    9ay1pt1+cQk3/lXxJSyfRfQ8uUuSAfV6A6Uyzs+7AHQ6b6D6wp60iistCEKm0wlPT//x6dM1YRgW
    RI61o34V/wlcX0f3PqncdpX2bdD3xj7lz+lvsZ/plV01QeAIRQAAAABJRU5ErkJggg==` },
    { name: "47", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAmFJREFUWIXN
    lyGTozAYht/efAIRgUBUIBCVKxAVCH7AiYqKihX3A1YgVqxccQJ5P6CismLFiYqKEysqEBUrKysQ
    iBWIighEZnKikAlcgULpzr0zmZIS8j758n2hBf5zycq1rBvYV9+azNM0U8abzR5a/0skgyCUaZoV
    K5dpmul9NQ53io6COBwSuV6/y+n0u9xs9jIIQmV6tCzV7gqxXr9LAP9AHC1LCseRR8uSIdH9IPSm
    QxwtS+5MU7Xq2CGBSuH2/YXcmaZ0AdV2pinH44kMiRRQW1SaqqBRruuqaw/AgggR56UxNlHrPKOO
    vjIkQiIEAODgL8Cj3/ByM58xPBoW5p9H9cCyxacdsSKfMQBAxDnIdeF9bAEAsRDnCBiWgok4B3LY
    OvXeAp8xjJc/Vd8hwh9vjiCNFeQ16g1QmC6nMwDAcjrD08e2k/lNABHniIWA67r4lWV4yrci4vyq
    5OsNUBj4jMEhgrcK1b1YiLtHYPQqBBIhYBPBNgzEQuBzPCmZJ3lCvp4TsLHSem1BxDneTicAwKNp
    qsSziZBkGQAgfTDw7DKg5SS8KQn1g8cmwj7PC/37uYlGiJsAdBXmheL4DOE4DKvVthbiJgCfMezz
    1cZCwMmTU4d4CN6wfZnVztELwNHKrFi1Uym9KT/3m8yBHkdxE0xVm1Ope7EaBskB2zBKnxWN6sx7
    AyjDDifeUAByfXmVXwYwuDoD6LWe6HUvhDoF7woADLP3hbrMdHH/YyFg3wDQJQKjH1kGj7FS6AHU
    hj48R2rQl9FokqYXDdWrWLt3zeu466/iQtf+2Wid/y9HMjvw7vazmQAAAABJRU5ErkJggg==` },
    { name: "48", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA4BJREFUWIW1
    l6F3o0oUxn/7TgUCgUAgEAhERAUiIiIiYkVFBaJ/QMWKiIonIldUPhGxouKJiBUrnqiIqKioqIio
    QCAiIhAjEIgRCAQi58yKhClJSAI5+75zcg7MzJnvu9+9c4d84f+Hqj1/2Z88GPjT5O+TW6L3BQCT
    KD/gvLp049pzUxAK4H1yi+v7n6PRy8HCvy4hD8MxYTjGspx9MQpQk8kU1msA0iRBJILR9KVRbNcU
    qDAcI8SK53EAgD/+oSeHwzuKQlKWJavlAq52DG7k6pICTS7EisWrZHjzleHwTi8oCokQK6bTGV/T
    HO8E8UlVp0RsbefHyGYmezvEAI7j8fr6gufZl+x/XsBs9qJYrxXrtRoO71QQjJRlOYpt/oWQqtcb
    VO9n0aUIVRCMeHqaMvv5qgeFWOF5ve2z5O3tg9XqA1pG31aACoKRJmyCEJI4Tvj27bY1eVsBjeQi
    zVm8/8f19ZA4eiOOE8Jw0Im8DVQQjHbybFmOms8/1Pfv/yohpGK9VvP5R+uc7+PUMdyJPM8zAB4e
    HvWCJEmZxwn39+El3MDxFKggGPHwMGE+f9ZFNpu90O8HRFHMaDSgKEru70Mcx7tYwLF8qZ/hNZ7v
    8fdbwePjPwBEUQygRTw9PWryLpVfx9EUeL6HSARxvKyKS6NqRo7jYZoWRZF35dU4egp+zd+5ny9h
    E1X9h+N4+H6g1+a5pN+/gQsK8ZRlqmFe9XoDHbVpWnoiTRN8P2CxeD637w5O9YGjm1TkaZpgGGZt
    XNbFt0KXolGO42NZNrbtAiBlCoBtu0iZkucSx3ExTbu1E61bca/3WYhSppRlgW275LlEyhTbdnEc
    lyxLKQpZXdNnnej0RWRZNnm+sdkwTKRM9dhyuaAsy84i2qRA9XoDbTOgRVTpqI9blo1hGJRliWEY
    Z9NxTsCO9ftnviKs10QlrhJ4TkSrT7KKaP/oAWSZIMuEbkrVvGGYJMmmc7qucXTv1g5UIuqo259l
    AsMw9ZpKSJomWxE+UfR6wHmyEVVNBzZnv25vhbIsdroiQJLE+H6w0y+yLGnkO3oZ9fs3jZbvI00T
    yrIANra7rq+j3pKe5DopAD4j37e/CXWxW7vP8Zwuwqri6+d/H67r77zLeEPs1XYWa90LOv0zUt4V
    GP7gYGL/EjJkcrCmCWJ9yHk0BV6DN5UY07R0pB2IG/l+A45Uv19UZipAAAAAAElFTkSuQmCC` },
    { name: "49", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAztJREFUWIXt
    lqGf4jgUx7/c5wSiIiKioqKiomJFRQUSgUAiESNOrDiJQN4fcAIx8sSIEycQK1asQCAQJxAVFSMQ
    FREVFRUREThOzCQLlEJhTqzYZ1qSx/t9m/fyEvhpP6gdOswfOvjdtF8uBZ/PF8cijfk4HjAaPTEa
    PdHi8yGA3mIxZz5fIIR/UcDzxPvT+4h2KwAALy8LPn+eX4QwRvNHoplFpR16OCWtANmfU4Ls+SKE
    5wn+KiO+7N9SEccDptMZcTxowD4M8G35hSRNeHlZHA8fhPCp65Ltdg1AWRYkyYA835Ikg7shei3j
    hzD8RBQlAKzX/wAghI/vhwRBRFHkAERR0oBYrZZoXV2LfxPgBMLzPDabr068LAv3BNy7FU/TEWVZ
    sNttb0L8eosQwBjDcDhhs/l6IhgEEYB7t+LWB2C32x6uQbTWANBT6tUtNcBk8htVpdC6xvMEZVk4
    8SxbI4Qky9YnQW7VxK0V6Cn1egBcPURRcgIFUFUK3w8BSNOELFu7dEkpbSoeAjiBkDIgy1Ynk+/d
    0JmU0hYgSTKgrmvieNCaimspOIew4i5IHA9cGsqyQErJarVkOp2hdUWet3/5vQBWuMfRWRDHiSu2
    IIio65rxeOr+8G02QEqJlAHPwwAu1MI9AFjxIIjcOVAUOVWlANwKWIt+f2a5fObvp6A14D0ADXFj
    DFrXTjzPt/h+eAzh0jXblCe/Gw6PiJdlQVUphJD0+95JXzhrQq29oMsKHITwieO37WWMwRhDUeTs
    9watK/b7Pf1+/1qM1g/t1AnhtBsKIVHqteHzyP2gM0Bdl0DAcDjBGEO/7zUajG3Vvh8ihI/W1dU2
    DN1S0NO6QqkddV1ijAG+93prSu0YDicMhxOqSjEeT1tvVPcCNCCsheEnAKrq7VTM838xxpCmI1ar
    ZSeIrrvA2kEInzCMkfJtb7/fFXpW5PjOkGVrxuPp1fvBvQAOQgiJ1vWlwG4+ihJ3OrYB3NsJnQkh
    3dl/Zj2tK7SuybI1aTpq83sIoJECO34JwvfDxtF9bp234bl4XZcotbNFZrccHNWD7ZL/B8DBCim1
    Q6ldw+EY5L0HdArcpQid+EftUiH+BwxOqHkP8J8FAAAAAElFTkSuQmCC` },
    { name: "5", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAepJREFUWIXt
    lSGT2kAYhh9mIk4gEAjEihWICASiIgKBOHECUXEiouJkRQUisj+gIgLBD4g4EXGiAoFAnIiIRCAi
    EBErEAhEBCIzqeB2m6SX6cC0U9E8Ktn9su+775dsoKWlpeUf07myvvjTOr8zUBHsu1MGoo+UAlsI
    AMZiyFbtSZQCIE0VDxMHwIytviwaNZsMFACz5RwAWwizmCZNFVKKxnttUJMohS0E/kevols3UAB4
    330SpXCdKWH8SppexHf+S4Pfn4y8Rw7qCIAzGRNHW57cmTGQKKUT6dQNFLPlHNeZ8i18RkpRj07X
    FyHQG1nITwMOqxOHKMMtzdcN6ZYs/MCM59EOoKMNFMiBmfQWHuso1juumFyPLO56d2bA6ltk+wyA
    h11er4dSqmMxBGCr9qYVxsBsOccWgiBcmSeP4Wt5wSIEBpNuRRwgP+YA5SR+YeQ9IqVgHW4qKVj1
    wjdRTWU3vZFVEU6/BoTxpd51pgA8NxjYqj0AtvfEwg+wHRvp3lfjfU+0PK/j1wY+D+9J4sQU2I7N
    zn+p9D0IVwxE39yvo7hyfc1BZFqgDUyPgg0pWXomU5c2NLWgiatPwvpLmKVnzqecPKP8Jfw1A/CW
    RFdY9D50OWxON4vfagDe/yfculZLS0vLf84P9Xu738QO9fsAAAAASUVORK5CYII=` },
    { name: "50", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAfxJREFUWIXt
    l69y20AQhz93DA4cEDAQEBAIMBQwMDAwCAjUAwQIFAgEBAYEFhT0AQIMAvIIBQUBfgABQwMDgQMH
    BAQEDDKjAld/LCet7iwH9TfjsXWWdr/b213dwX+dr/LPx0pfznUehjFBsKxAPhWgDIIlP24E935m
    bcQWoAzDGAB/GrC4uf50ANJ0y2azJt1u2CaJNcDI8rkSQIRjvucuAPdrZWVzbON8tvIBSJOMJPdR
    mWYSSwCyp6I0gTBdgtp5rgsApJRczxf4swlABdK7IkwAaudtea57dO14wsCkRRLmuqhn73iCojj8
    TpMMxxPkam8UBasqyNX+ZKya+UUjUM28dupK8qJgu9v9FW4wgEqFbpxUS+C4hypwPHH0/5AAo93j
    acu9iwV3cRN2leTs9Vtvo8Z9YLfKEEHz2PPL+BCF29ZNur898yU4rjocKU9K0UTGAMIdI90m5FLK
    05sMeKySsF1qSuv3IS4JAE3Wd+XNnMsCtMP/kYTbP7fP3ZLVfQA+jsqgAN1WqzKDmhsCYGjZVUEn
    1O13galstmQlwLevEUprnn7+4na5YHp1VV+b2LaJwAgYPa6e6w7YcT7q6xzs9oS11ulb63tiZcP6
    XBBFD0cDnucxnc7B8IRkA1BG0QNKKZQ6JN/r6wsA8/nSGOKsc0HHxntj/9RvQrak7KY+O7cAAAAA
    SUVORK5CYII=` },
    { name: "51", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAApVJREFUWIXd
    l6GTm0AUxn/XQUREIBARCMSKCAQiIiIiAhEREXEioqKi4kTFiRP3J0RURJ5EnIyoQEQgKhARiIgI
    BCICEbECgYjIDBW5pMf0GmBzV9Fvhhl4y7738fZ9y1v4D1C8XEq4uTZ4pyMA2O0SJX+friSAbfdZ
    fhvgfx2AQiauJmCaJgDdXk9pvnYtgeVyAaNbSNTmqxAopfn5wQIiZrPwrfHKmmhaNIXrfqbdbiOE
    oNvtYmVzALb6PQBxHJMkCXmeEwTPlTGaECgmkzuEECWjkN+JU40NQxzHKY0lScKPH08X4zRagjz0
    ELpessWpxnjUpbsJQAalsXWYVfpsrIKOaSJsG28hz8EBXP+A6x/wFhJh2wAIoV9ypUbghHarnLzt
    o0Mw1s72E4kqKMnQX8YAyF1esofRHoDZLGQ01BDmBxDYpel5WhhnWNktAM+zOwCE3gLA6fdZr1aV
    /hrL0LJsHoeShZ9xO9ZLqU42GxZ+RiD3PH3pMPtpsN1uLsa5aivumCaeF+F50dlmO0YjH40JGIaJ
    259iOwYzf0Nm7InynLkf4q1/y87tTzGM6iJoTGBqhcTR8YsNHeQrqRuvVBdHEVMrpAoq/UABcO+a
    JAeJzCDLDgjrRX6awTxIa8dQkuG9ayJ3OZtcIPKENhq6bBHmJlLGtQKfoFyEYX5c39FQYzTUzs87
    o9vIz1Uq6PfdWrZLUFmCm3mQFpPJGICHxXE3tCxwnEFjZ8oZWK/LFb7f71mtgr+8/QEETkHr2D6M
    wHvgKgJpuj3d3rycC/4tgfeACoHCsmwMw0TK9I/B9TrEsmyoeUhRykDVT8ZxBkwmd7VINO4Her0R
    AFKmb/3rC4BOR9BqHRuTqn5AqSGp4bj24eQXtbzljyRnDVwAAAAASUVORK5CYII=` },
    { name: "52", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAl9JREFUWIXd
    l6Fv20AUxn+dAgoMAgwCAgIMAgICCgoMCgwMAgIKBgIK+gcUFBYMDhQGBgQEFBgUGBgEBBgMBBww
    OHAgwMDAoOCAQaQMeE6rrpt89rJJ+yRLts7+3nffe+/uDP8BDj+uRvjUNrh+fmQ5HVVC/qqAg+te
    o5KE503SgqYdDvr58bC5nzROQysHlG2jkoTtJm5MctYkMICybQCeXl6OAw/7vTFvxzR4kqSQSzpd
    m73nAeBaFiMpmOYdRLFldjE91BVhkoLDarWGXKLP+8T7HV2ZMvky4zz6RiYV1j7HtV1WqzXUrAlT
    B3haK7z5NX0gAbr3Uwr/kgLIATs26wijIvQ9h8nkivD24ZfvCCFxRzaLRQg1XDASoAuLIAgBSOcB
    A6EQ2y12nDAQinQeADAvU1ALRilYLAJubj4jhGQ8Hv407nsOAK47ZrEIanEaOXB3dwOA4/SxrHN4
    SUlDWd4DWd5B7QoABoN+LU4jB6IoZjweolQKQK/3GiTLcgCSRJEkitvbCdRoRRMHzmYzj+XyCccp
    A2tdzlYpAUAQhEgpkVLWJjVuw+FweAwchhs8y2K9UQwGBb7vsdultWffSECFqgjjr5qrq8umNM02
    oyp4r2cfnz/qipMJqCCKbZvP2wt4j6odTyrAu/h9f49GzmkFvIVru20+by8AyrPAW1QtejoB3dcU
    aF3Q75SdHEUxWhfGddDIASHqr3QnEfARfN8liupvw40FWO9y3hbGArTW/1ZAluVHq49i9tlxvFqe
    68J4M6rOAlmWo3WKTXkQKY+kEMfCiK/xj8mf4v0OcDnjNO7R0CAAAAAASUVORK5CYII=` },
    { name: "53", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA41JREFUWIXF
    ly1w6loUhT/eICIQEREREREIREQFAoGoiEAgIhARFYgnEBWICETlFQgEoqLiiogKBBKBQDyBRFQg
    IiIqIhAREQhEZ84VIXnkj/be8uatmcyZs3fOWSv7JzmB/xm1L94n/mDNzQQIVW2mk8PBv6mIv6pI
    kyshXz92+dlX8/5vo15G/vr8lE6cHwvWj10AWu02lh8yGAwAeHj8IfhmNKoiAEDoRwAE7348+j73
    d+Z3+ArIqxfz8WPGIEVLmoaBv9+zXEX0H/7O+Mfz57J9vozSCEjRkvnzM4bmpeQAg76c8d0CBQHJ
    EwMpMYAX1GkaBlq9yaPVAKgSUVWcpfarNQCwWsdR6PdaQFyI638+MuIuSWx7nJBlrgt7BmVdAIAq
    lbtGTy9MJl38/T4vQtj2GNOMizQZATabTTpfLOaZzqkU0KgQMOjL+Pt9pjbOqJ03Z7GYE4YhiqIk
    pJdjpmBLU7Bax7nd7k4F33Z3YrmKUhE51BKyMAwA8Ly3SnK4EgGArRehSB0akQXA63QEQFOWWK4i
    BhTqQNj2GE3TaLXimjFNE8/rEwRBIfxlisRmZqY9P+jLeEE9LUAg9W3CE6YisQlP+X1ETPyQGjab
    1yq+612gahoArrvDdXep3biLc1tCnsxrCel5rJWRlwqYTreYHRvjTmG62uN/hETKid3xyHy1xX2L
    aGkflU90hhgOJwSBz3A4gSsfroKA3n0dbxc/rSLHtjD616/I4L5FvAzVqxt/FXkBNWd5pP9z+509
    xXA4wXWnALju9GoUSmtgbGqEhyP79/gs0AhAO9aRQym2+R9ly1Ik/d9oyJn5lwUAbI9xAe48jd59
    nd59PbUdlFbVst/G1S7odMq//Z2Oycg9QEkbO86M2czJGGczB8eZQUkaygTU5puAu7tuSuYsjzjL
    I0Bq/68hdN0Qtj0Wqtq8PB8KVW0K2x6XnQmF48wu7aLd7mXmOT/wSQpOp+K34Jr9T/DpeeB3IEmN
    m+0ldN0Q7XbvMgVwTkO3O8iHUjw9vRRsuRRASRpuGoE8ZLm6/68JELpuoCha+k3PIwg8dN2AG/2c
    FARY1ki02z2h60YhhKraFLpuCMsaCcsaCbLhT1Mly2p65fe4SIPIH0iEZY0IgnfCMOD9fQ/Zl03t
    cPAFxJ0gSRKyHP+uJWMUHQRQO4/pugthSFIjvb/wJjuHtoy8EKkK+2c/KZl1vwCK5aDZKMZWKwAA
    AABJRU5ErkJggg==` },
    { name: "54", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAhFJREFUWIXV
    lq922zAUxn/Z2QMIBBgYDAoGFBgYDAQEFAYE5AEGDAL0CIUCe4iAPkJBwUCBQIFBgEFBgYFBgd/g
    DizS8WKncxIZ7DvnAsuSvk/3j67gP4AcbRLMRpBfMv9ifIm94SQCiuLhs9/ChGEKm2udDZHIfv8s
    zlWy3z9PIkIAKYqHc6cUpZJg1wgYnQNaZ0PiaNuGp6dfvfFYkAEDEOcqca4SjmHwHogdikCsVBLy
    wJN4Ym9+3AuLJkKpRIyxonUWyPJ8LYBsNrtgdJJybE6MyYFZ2zYA3N+vSZJvABwOL72JWmcUxZbV
    6jt+TQwBADNrDQBV5QCCEIC6rgFomvcwtlxuMcZC7KTsuDbkRp6vT0tRtM7EGPvPUFx6FftwzI5G
    2zZ8fNS9eQOeGhRxS3MRpRJWqw1pmlLXNY+PP0/3FqWSbj5Ea2a98uyG4MTt01zRxthQmiekYowd
    TRqtHXs3bzY7FovF6HVfbyXulh5AWTrK0o1ef7UHrDWh/j20zlgsek1rGgHOVex2P+iUZcAlIq4J
    gSyXW97eerUfkKbppAIAKMsS58bH+hyuCsF8Pj/7L01TrDUolUCkbjgaTfOOtYY8X9O2jX9FfSoi
    poBZ2zYolXA4vAw94QZx8z0wICK8Ff1YZI4/122er8891SeFaJ2Jc1U08kvdI3d3q/Dx+vp0zR43
    CYC/T31zfH8D1K0mPN8k+8MAAAAASUVORK5CYII=` },
    { name: "55", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAqRJREFUWIW9
    l6Fz4kAYxX+5qUBEIBAIRERERAQiAlGBiEAgkBWIigpEBX9ABAJxogJxAlFxoqKiogKBiECcqKio
    iIiIQEREIBArEDeTEyW5UChslt69GWY2u9nve9/bt9kF1JGeMTfHN9XkV1fDjETxVxoXKsldt58/
    eN40b4/HgxTQygQ79fLBqly3T6t1CUAUhQA8Pk5k4pUikA7dxk5Hr9kEYEabOI6LiZWSH5u0l7yI
    iR/LxJDCSQ8Ukw26nW0rPjuxDD46O50Mb9Onu7u9fs7Ykse2ocaBKuN4uUPScToYhp0R+VICn2Iy
    vM0TjppCJYQagSRJCKOoSAK9WuWHW/0vBLTvj09YpkmjYQDg1iqI9ZrJ82v2Tmk/qDg5HXQ7RC8L
    xOY3ptMiCV4Zz97yF1otSzq26lmwB6/bRIgYIWLGN9cgqYQSgax6gEa9DoDY/OZpcsf67e3Y1K8h
    UITjtHaIhWGAZdnSKqh+zVK3VgFgbbSpLt8V0SsX+KsNg24Ht+0ShgHe/c+jeVSOYwAWlrltxbBt
    jywH/z2hNJTuAxeXNiPL2emMk4Q4SQCYzuZ064KmRDAlD4wsB8uy88QAbttVCaW2BJZl52bLCBRJ
    TGdzuve/su6jPiurQLp1N5Zl4y98prP5DokCDh5m5xBIxzfXefX+wt8ZDMMAKL8USh7I1n86mwNo
    mQphGORE/gmBOEnwF34uPR8kzpaizKe4lAnF8gUA3Wh9HNKms3nat6uES9D1inRMWQVSr2dimDV0
    vXKwegDDrGGYNYTY4PVMkFChtAeE2Hw2pI2fo5zIKpG7KZUisEoED8EaPt9e2vg5YhmtAKRUKEXg
    SPUHIaOCDIF0W4kstIdgTa2uS3nh5H/Dvv33wnlC/r25Xs9kGa2OzvsDV/gU/fJIq60AAAAASUVO
    RK5CYII=` },
    { name: "56", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAuZJREFUWIXt
    lqFzo0AYxX+9OYGIRCAQEQjECQQioqIiAhEREXGioiKi8kREROWJiP4BJxARFRUVFYgIREUFAoGI
    QCBWIBCIEwjcniDQpCEN1+llTvTNMLCb3e+97+23u4FPfOI/g9w8J8OXbfKbm1/MZre1kJNCmuZA
    CpFL3/el63ond2JHxF34uC3ipEIaEULkMgji10JOIkaa5kA+PgaNENf1pOt60jQHHy7iS0vfWRwH
    zOc/eH6OABjaevUejnBdD07khjTNgVwsllKIXJrmQAZBLH0/ahz5CBFnHUQAcHPzk/NzC4AkSQEQ
    ImU6Hb0nboOvxwTGcSDH42s0rSI2DB3D0EmSFN/38f1oZ8JGVO3MUSFdlcrx+JrJZIKmqRiGjuOM
    WC6XaJoKQFGU9HoKWZZTFClClNvuHOTpbBWb9R6Pr1EUhen0CsPQ6fV6ZFlOVIY4fQeAKIqByg3g
    9TKdHWx0FTKb3eI4Q4DGgRpZljffQqTEcYyqvoyZz692eI/VQEO63TBNEyFS+n2d5fJ+b7DjDJvs
    kyTZEfAaXQTIxWLZNDYZALBa+XvBoyhqyLugkwNR9FLp4/E1nudhGEZrZmVZ4nleZwFdakCu12mz
    94uiwLJMADzPx7at1km9ntJ8Pz0FXFxU58lgYO7wHj2I1ut0q7By4CXrMIzQ9eqYLssSgH5fJ8ty
    NE0lDCNew7YthkOr4X5LwB55llVVXxQlRVE0O2B7J9TkWZYThtGeQ/XvtYhDAnbIq0mwWlUZWZaF
    pqlMp5cH1bvuHWEYkedVjMlkRJKkaBpkWTXm8nLYehs25EVRUtkOtfWK0kPTqh4h1nuThVjv9SvK
    b4qi3DilbpIwCYK4dQnk91m3Kr6/bb2IAOgao/X/QB3YUFLSYLn3Bgge5vT73w4+wcP8aIz721G7
    A7btkOcpg8miVXUdvAveiqGq+sFdIG27uljyvPup9jdQVZ0wXL29Df8J8y7ecxl+LP4AuoWKcBEF
    iygAAAAASUVORK5CYII=` },
    { name: "57", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAnVJREFUWIXt
    lSFw4kAYhT9OISsiIhARERGIiAgEAoE4gaioqEBUVJw4cQKBQCIqkCcqIhAnTiAQEYiICkQEIiIC
    gYhYsWJFRQRuT9DkgEBL6VXcDG8mk+y/+7/39mUngQsuuOCCC/5z6I8SfPmIeBQt/4mJs8QB3W53
    te8HOh+fQ3ROAjqKlvh+gBAr6nUbx2mQpio39qkodh5FS+37gW63uzpNlU4SoZNEfCiNN8W3hR2n
    oR2noZNE6DCM9WDwqMMw1r3eSIdhfLKJ97yCShj+YjAYUq/bAMxmAVIqADzPZToNaDabZNka3w84
    xUTlHQZyaMdpMJlMkFLx9BTheS7z+Zxms8l4PKbT6QCwXC4ZjXqv6hybOOrccRrc3NzR6bSQ8hmA
    MAxxXbdYEwQBtm2zWq0AmE4fj2oeMqDDMC4GecSmaZRq23XTNBgMhiWy4XBAHC8BEELQ79/t6B5N
    4OFhfGTqfOyLv2YAQN/e/igG9/cdYLPbNBUAWFaNxSLGMIydsee5xRql1M58u+3u6B5NIEnEVtQK
    KTcxZ9maLMswTQMpFa7rFE1SqqKeP28jr22bOHgGtsU3TZCmawCq1eo2CQBXV+YOwWQyQ0rFer3p
    qddtkmRV9AN0u22Ayv53oBDPsjWQJ/A3enNXqwJUnp8lrdY1tu2yjzSNyLI1llXDsmoAuK5D/iPb
    T0Df9oIDoZTxe9Qp1a6vvyFEit36fjLHfgKVnNiuCkQ0Lt0Bokkfy6qXrjieo5QgmvTf5HjRqZQS
    8Lyvm+Yju8jJT0Hj5uFgffX0E4DFYnb4EALkRpQSJwu+BcOoFcIvKCVQMvJJOOcf9Dn4AysSQ+p9
    u7gQAAAAAElFTkSuQmCC` },
    { name: "58", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYxJREFUWIXt
    lSFzwkAQRl87FZGIFYiTiBMVkREVFZH5AQgEAlFRgaiIqEREVPATEAgEAhGJqECcRCAiKk9GVCBw
    qeiQgTa0B3SYijyV7Fz2fbN3c4GampqamprLUnwtXF9S3n5KK0NcSl7U8n8pv/kLUUXtyvXjcwMU
    3W6MiGCtpd9/ACAItPPIz57AaJQAEIYd0vSVzWZdGZQDU3EeFRWjHo/nNJvCbJZirS3rcdzfW7da
    vdHrRZU+1wkUSTLCGLPXPEmGRFHEer1GKbUTbAqAtRbP8wjD8GBj1wkUSTJyXLqPiLBYLLZb9c3n
    EqB4fByQe/5JAQBCzXlbkHs+m7cUAGPmKNWi0RDe33MAGg1htTIA3HeG5MsJAOK3gcNy5wBbbm99
    vFZEvpygtSbLMgC01qUwX04QEVAhigyL/rGn099wmQ7wWhHGLDDTuJQHwR0iUj6baYz4bZRSpXzy
    Em3bVN4Nv52BQuugfPGjZ5e8e8F3yTLzzel0COHzojmV+Xx80HfWRXQEx3guywdes5HRcnBK8QAA
    AABJRU5ErkJggg==` },
    { name: "59", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAclJREFUWIXt
    laF7m0AYxn/ZMxERUXEi4sQJBKICgaiomIhAICYiKiYqIvYHICr2B0QgKxETExEVERERFRUTiIiK
    ioqIiBMIBAKBY2ZQSICk2Z7N8BNw3/Hd974cdxz09PT09PT09PxnBn+hRv4ndfcTm4p1EscZaZqy
    3WoMQwKglDjZRDUp9zwf0zQ7Bygl2WyesW3J3Z3PfD4HYLfTvw3FaK25v/92kvZZM2DbDgDT6U1r
    zsPDgqur6zK2LAulJMvlCsuymM1cgMHHJldVQzfeqgwkr2U7yzK01q0GquIFxSwJIVoFm8jD8JWn
    pxDbloxGkvFYEEVxLSlNM0ajYWNf9VmaZgRrzcJvnoED8SBY4TifTvB5HGcWAJTi5aVN3PN8gsDn
    8vKaONZE0Y7xWJ0lLoTk5eUnSRLVdD90jBn4vgeAlBLTtABw3Sm3t18ZDoe47vQgLu77fYZhNIp0
    fYIcIEki1usFs5kHfMZxJgCEoYkQAtu2arFS5kGOUibL5ffi7YvanZ8gL7ZawXb73OH1OIZh1eLN
    Zg0w6FwDk8mXWkeSxC2p3VxcvG27x8cfRfPoIoS9H9O+oVOpiB5ovvcwevdZcabOv+MXJw2ZlQeN
    lUYAAAAASUVORK5CYII=` },
    { name: "6", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAatJREFUWIXt
    lKFywkAURQ+dCAQCEYFYgUBEICojIiIjEBUVkXxCBbIfgIio6AcgEBEVCASiAoFAVFQgEIiIFQgE
    IgKRmVS0uxMIBEo7U9HcmcxsZpN3z7v7EihVqlSpP1blinfS36z9XYDU9F0awqTZFFhCcCtavMsV
    SymJIslabmgIk0XwclH9SwB0x53nB3zb1YYAlhB761vRIpxPiSKpIAp9zgGkvVHAUkptPAjHenMT
    TvXa9F297vodAJ1KURpFAOnwbUQ/HLKcL7FsCyDb1VGpIwLwHPssxCmAtDcK9PlOZvNjcaaTtkG1
    XgXAncVqT8/JWm7o+h2eggEAyWyR8zwJQLOBIUzqX910/c4eiDI3TAOAeBXjLZJcEp5j60aCu95F
    AGm7d18YddZ81H3UMwLQD4f6Oc+xdfcAlm3ljuJ0AgV7hwDKRM2J59gMwrFOIKvDFK76EYVAw6lh
    mAbuRvBKxPpzBvAzD2a/DNBfzUUzcBZCpbDb7ki2EMtEmWdrHv41c343VwJUvEVCHO2otWrstkfN
    1X32yhe6EkAp2+FPa5UqVarUP9UHzdK0cYrAxjsAAAAASUVORK5CYII=` },
    { name: "60", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAbVJREFUWIXt
    lSFzo0AUx3+d6QeIQCAQiAhEBaIiH2BFREVFxYqIE4iTESsqkIiKiJMnIioqEBEViBN8gIoKREUE
    AoFEVJ7bEx122ECStmnV8Zth5u2+fW//PB67MDIyMjIyMjLyv3N2xK+/IMengjXAep1Zk2makiQx
    Ly8lAKtVwnb7dJLAIaeWcjm4eLn8ies6ZhxFSxzHGVzbkqa/DgrZndRS2W9dP93jzX7stY/5qfNd
    IdbeXQFaqgwRvA183zOO5+eCy8uQqqq5vhYAPD62iVPCMARgPhe9mJub+ZsvWlu7p6srgLPzflGg
    qmpLxN3dbce7RqnIJHRCCWx7sS2bzR+qqkapCNf1CcNZvwzdChRZgudNkVIaR9M0pgIXF1MA04jd
    CgRBMBjTFbfZ3BNexaYCe3ugyBIAlIppmsZqNqUiY0eRMvZ7BPi+R1XVlH+9VoQtoH2kyrRUmQ6C
    mQ6CmY7j33oycfVk4lr20Nwhux1LlWlAW59AiAWvr42lqCyLnsohdpvsGE2RkucP/d8QQIgFdV1+
    KOFn8Lzp/pNQiMW3bp7nD8DhY/I998ApnHSHfBn/AJuN1uMLUCokAAAAAElFTkSuQmCC` },
    { name: "61", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAghJREFUWIXt
    lZ+f40AYxr97n8JAYKGwsFAoBBYCC4FCoHBweHBQWFg4KC7cHxAoLCwcLgQKhWLhYCBQCAQGFgKF
    QKEwsBAY60E3abL9lc+1dnlk5n3nzTzPvO87E2jQoEGDBg0a/O+4utA+63/dsxy8Phh1AqNRAIDn
    ubiuXYdrx7mWUtUiS9MlQgh6PQfLsgp/lmV74+dzhVKK5+envSIKAQ8Pv06St9tttNb0ej2SJGE6
    DfD9F25uANqVWMsSZJkBII43IiaTlx0RrVxIEIxqlyAIYDj0AVBqf+aEsLAsAYDWGiFEvlTplzoN
    s359neG6DgBRpPD9bba6XQetl3Q629qnaQKAbTtEkazEAjiOg23bPD5+O9mxBblSCcYYOh1xILRc
    Al2x80xkmSGOFVJKHMfBGHNUwHo8lhhjEEIUYxnb2mtWq41vX1yO/ACrFQRBgG3bRQ8cRJJs0imE
    hTH7O71MkJMbYz6+q4pJ083Ncd0evv+TL0f2uxoM+iyxCUPJwtwShrKw87E818Ip7CiaV+yy35iM
    KJpvSI4IKLr1x9OMWxKknNFqCe7uHN7eFJ7XZ7FYsFymeF6fMJSVtc/2dBrgfh+h1QQpx3DkFqzv
    779WHF1veERrfSzC38U8jv+czkC/PwDg/V2fTX59vbkZH6eHuu9AWcg5KBPvTOoKOROX+vteDn8B
    mfvlrGCWWq4AAAAASUVORK5CYII=` },
    { name: "62", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAfFJREFUWIXt
    lSGXm0AUhb/0VCAQESMQIxCIiApkBCIiEhERsSIiYkVlxYoIBCIisjIyPyNyRUQEYgWiAoFAIBCI
    ETgqtpldNiGbtsnpnlOumrnvMffNmzsDdOjQocP/jt6N1q0v1bhWAa8FWa02erxYzM/qnCugPhNr
    II4zlFIAWJY4itu25o70PreJp2lBkmSYptEIKFUBaD6OE0zTOMoDyPMCyxLs9z94fNyzWMzrt0W0
    daAOgjVx/NQSBt/3Adjtdq05r7HZrE7RvT8+Atv+cpHwAcvldywL0rRiMhkDIIRx8gi0cBCsGY0c
    oihDCIFtS4CT7T7A81xms2+E4QOOIxvj6fQr9/dzJpMZrusCLx5oiPr+CKUyQGCaBnd3LqahUJXZ
    KnzwRtv8BQVhGBCGS+DZA3UQrAH0DsfjIXletIolSQaA48jG3PNcdrvTvjnEPM/VnG0LbcL61Jk6
    jkuSPB1xWZZQVUrPiyJr5Agh9Xf9vtBcWTY3FUVbPv0a99I0Jk1jnTwa+XqB4fTZwQfOMAzNSSmp
    qorB+IGqqhBCIqXEMEyG01WDU6pEqZIo2hJFW2i5BRc/QH+BW/0Cfh/vVXKLbrz7EmrRwWAIQJ6n
    V1Mvy7yh/baAut+3riZ2QSHnTfgvOtBazBXxcW5Ahw+BnwswtiDNVmQ6AAAAAElFTkSuQmCC` },
    { name: "63", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAedJREFUWIXt
    lC1z20AQhh93Cg4IGBwwEBAQMCg4ECAgICAQYBBgEBBQEFBYECggEGAQUBBgkB/gH2BgYCgoIBBg
    ICAgYCAgIHDMJe6lciLb07jTzNQP2l3t3rva+4AzZ86cOfO/0zvhWps/0fn1YV/xUUTRlIsLBUCa
    ZsZOkoSHh7vOJnrA5ulpjuMIikIfJeZ5itlsDoDj2Afzl8sls9mPN/V7wEapgDAcsVzODy6mtUYp
    j8kkIsvyvblVVbFarRDCYjh0GQygKDRXVyEAUor9WxBFU4LAJU1LpJTmby1LdIr6vuLm5jtxfIfr
    2i17PP7G7e1X4vgepRSPjxGf3xIdjQKapgQkliW4vlZYoqHRVqdw0+i9/m9zIY4j4vge2J6BKJoC
    L/sZhh7rdWVKXNcxdp4X5HkJwOWl3/J9X5EkWedkkiTD95WJOY582QLH+fKqyHUVeZ69ipVljtaN
    8auqbOVIaZu6fl+aWF1Xrbw0XfBpa/eK4pmieDbJQTAyC3jjCYCJCSFMzLZttNYMwzu01khpY9s2
    Qlh440kr1jQ1TVOTpgvSdAHbW7DLu9+EIzjlA/g+DnXyN6bR63R2RYdDD4D1ujiZel2vW9q7DWz6
    /cHJxI5oZP8h/BcT6GzmhHycG3DmQ/ATfV24Grrw7L4AAAAASUVORK5CYII=` },
    { name: "64", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAfNJREFUWIXt
    la92o0Achb/sWYEYETECgYhAICKQyIqICh6gMiJiZUVFBbIiIg9QgYjsA/AIEZWIioiIiAgEAhEx
    jhUsU0inDQ3tOd1zuIY/c2e+39wZBhg0aNCg/1hlh/bynG90KTyOExaL8L0xyjhO9MMHPn73gf+7
    lo3B9WyTJDH3/iKVcZw0Iy6Bcrlcl8vlWredeIy6dAnqIgCYzQIAhBBGYxw/cX8/N/IuWQKtzWaD
    lJLtdouUkjzPkVICkOe59q1Wd0b4ZwowRpimzyilutbbHGP05uajDlH0iOe5ABwOB9I0ZbGYA9Us
    s6zy2Ta4rk8QBNzeRtzchFxfh8znfwjDGQ8PKxzHaSVymoARattVrHG8RkpJGIYaXksphRCVfzyW
    +n1RvPqi6I71+qnVr5lAGUWPAEwmDpZlIYRACAuA41Hh+xVgtzvgug5pusP3XXa7g/YIYemCsyzX
    97WmU6fFPV2CcjKZAmBZrzvasiy6SCnV8pr2x3b73OL+Omkf7fcv7PcvKHVEqSNBcIWUDlDFWRQ5
    Ujr4foBSCqWUfq6h9bsguGqBT+GmBJo6d9Z/Vn3OnO9Tl6q+Kgkj670CNNTzqrXNsn0velFkRqbx
    Vzoe271gHQo5exK2Yve8oFcCjdm/YXbdmX33wc/8Agb9CP0FsRfIlIa10c0AAAAASUVORK5CYII=` },
    { name: "65", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAaJJREFUWIXt
    laFy20AQhj93AgwMDA4IGBwwOBBw0KCg4IBAYICBQYAf4WBgoEBBQIFAgcGBgAJDA4MAPYCBgIGB
    gICAQcAxBWSkOo3GUlujVt+MRnt7q91f2r0R9PT09PT09PT87wwukKP8mzqfTpL80WVtxG6Xsdtl
    FIWnKDz3999qn7XRufwMgDKO10g55HDwnV55NtM4twbA+xcAlFKkaVrbp7EPDxGTyQQhBPP5DXH8
    xHJ5i5TiTYDWXzDmhs1m3Vrce4/WM6ZThZSTxphTIWmaMhyO8P6FMNSAYLtNUGrKYmHq3nTpI9ZG
    aK3x3lMUxYd9IcTZ538VbIzuNISltRFhaBo387xgNBp1SPMT5xzOfQUYtAkorY2I4+i3CrRxff2Z
    5+enTgIAyvE4YLm0CCFw7ns9L033ppjKN5/fkWUZq9Ujx2MOMLhqK14ZVQuSRCGEQEpFGBr2+/27
    dVNM5UuShO32B0EgKwFnZ6BUalYv8vzQ4WO1EwSyttM0aR3CEsCYxTvn8fjxBHRhPH47JZvNqnJ1
    moFayAW5xC/gH+EV3pG014XgiTUAAAAASUVORK5CYII=` },
    { name: "66", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAclJREFUWIXt
    la9zo0AYhp/cRKyoqEBUrIioWBGxIiKyAlGBrDgRERkRieAPqEAgIyIiIiIiKhEVKxARkYgKRMSJ
    SOQJHCc4mDJtClxOdXhmmPm+3W/3fdkfs9DT09PT09Pzjcj/fp0YXCFWY7czAMxmdqe5y6JOzpWa
    cjhEbDb7D31hGOI4Dp43b2MiHwC56wYAWJZV9Ugpa5X390U+n88rcaXUxZmTJGkykbtuwADIR6Px
    O+H6pFJKtNYAbLfrSnwy0Q0/B7Z9ucZ1A4LA7bYFaZoRxwlaK+I4aax/fS3ORbmyaZrWYqVU60OY
    p2lW23PHKQ7b3Z11aUwN31/heUsANps9xhi01q0MfBD/H0gp2W63DNuI+/4KACFuyLLfXw7Isgwh
    RBUX40StRogbkuSEMTt+NBgYWJbgjCKKDKdMEkWmys+oWhxFhlToKj8eD7X8ffspK25V4z0tg59u
    iCTBmJDhUDAea97eYgCkHHE+/+LhwSaKDIvFkvV6VeVl7WKx5PnZY/rksw+cRgP5ZPJImp4BmD75
    DV7bc3zxqrjVCtj2DIDTKb5K2LIkt7fFrTFm18rAp0auoRQutbs+Rp1fu0/41wfwm/IH5/S+pOwE
    tVkAAAAASUVORK5CYII=` },
    { name: "67", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAftJREFUWIXt
    lSFwo0AUhv/cnEBEVCAiEAjECsQKBCKiAoFARFREnKhAIBARyMhIREREBSLiRMWJioqIiIgTKyoQ
    FYiIEycQCEQFbk8k0NAQIEyn5vhmgN03u/v/bxceQE9PT09PT3f4Zyzyras4Y9GnmegizgnROWMR
    P5r4UiOFOCE6B8CTJPtSE0XWhOhcllU+nc74dhue7kbVVcngWnHGIrjuDOt1AABgLKyd8PCwgq6P
    sVrNT/V43m5j4Mw9YxHGY4rZbIEsy2rEF3CceS5e4LqLwlCTAT71nksBMTtkLAgClss5KL2tnBiG
    OzjOuzCl9BgPQSmFbVutDADHHXDdBQRBKIJ1mVdxasAwDEwmOgAMvreZzFiE3Y5B0yQMhxJGIxFx
    nJTGvL1lGA6FCyu8o6oKlr/2Rb/JAA+CZ5jmbRufjZj24cV99A/bX9wuiXuejyDwoapjJMlfxPEf
    jEZyJ3FRlPD6+htpGpd060rxwPc9AIAkSSDkcIaWdYf7eweCIMCy7s76+fNjTFGUSpG6I+AAkKYx
    NptH2LYHYALTNAAAjBGIoghNo6W+LJOzMbJM8PS0zrPP1649Aq5pZimw39cXnCYUhZb6Ly8boOEz
    5IbxoxRI0+TC0HpubsSivd3+zJutKmGpCn401JYT0TPNq/8FnRxcr/Mf8Q/I0MFEMbKDjgAAAABJ
    RU5ErkJggg==` },
    { name: "68", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAkRJREFUWIXt
    lp+X41AUxz/dsxAoDAQKDwKBwEAgsLCwEAgUAoWBhYFAoTAQmD+gUAgMLgQWFoqFQKEwsBAYCBQC
    hYVCoVAYqL2FNpmmP5K0Z2r9npOT3Hfvu/f77r3vvcANN9xwww2nIbfPVdE4FTwMIwA8r11lexUC
    sF39ESKfSqiOEwkQxykAg8ELAKPRr08h87WGTQOQg8ELQgien58KSl3XCQJf7tiehXMmSADX7SKE
    wDRNAKIoQtd1AILAv4jEuZC7Txyn0nW7Mo5T6fuB3NdXOatTgn3srlBmPQEwn88Jw4jJZAKAbdt4
    XltSkpVLCBSg6zqdzmaHqKpKkiQ8PXVz/YMfMQwOSORy7V1wDHGcMp3OSidPUhgGxS3s+0HeL1UZ
    kA9+lAtJ1Me2N84URQEgTdMKFwa9Xh/TNNE0wWgUYRhGrq2dgV6vnwcFWK/XNaZ+INs1SZJg2zau
    +w1qZADYpPr1NcayBM2moNVSWSyWBZv39zXNpnJ0bFenaYJwPM9tKksQhhGO86MOz0o4XgjkPVHZ
    hNL3A8Iw4P7+O8vlnMXiH62WdlFwVRVMp39ZrRaFuF9K5jS2nYoQAsPY1LDd7vD42EVRFNrtzoGc
    vffHstNyH2UlkACr1YLxeIjn+YCL49gAxLGBqqpYllmQNc04sNE0g9Hod7b6zHdpCaRlOYWB2Swp
    4VoNXTcL8tvbGKBR2gO2/bMwsFotT5iW4+5Ozb8nkz/ZZ62TsHAK7hOqi52gBzHPvTov/Ue8+hV9
    Mf4Dv97ML5mZTDoAAAAASUVORK5CYII=` },
    { name: "69", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAx5JREFUWIXt
    li1s3EgYhp/kDliVwepksMAg4FQtCLBOBgsCAqIq6LTgQMGChQWBBVW1oCBgQeCBAoMFBgUBVmUU
    GSwIsKIAg1FlYEUGo8jAqgwMlk1B6un+eNum3bslfaWRP898nveZz+Mf+KVf+iK1C9P9xjwI4gZi
    JyDKcY6VEFIFQbxbiAaEHVVDNSBBEO8WpKnGLkF0NRznWHle2AbyvwBpkMlkqoSQKooSBajJZPrT
    Vfn9O3L2AJJkph6OCbZtI4RkOBwihOTw0FaLuRsWsWnsUdK3ZDx+q4SQynGOVRynX9snKo7Tre4f
    5Xnh0iPbxJPJdNVM5XmpDg4OtwvQbMoGRAi5BOL7kQJUFCXfNP/R+6In9P2IMAyZzUJ8/xIA0zSo
    6zm3twlpmpJlGdfXl62e3wJoI1+8RnW7fwIQRTMAiiJdSva8EMuySJIEoAHRc+wv5KrV5nkhQkiE
    kJydnSOEXIMaDl+0mFufG9i2DYDjODiOw9HRP0tzNCTK80LS9GGCXq9Hv+8wnb6jLMulFQ0GAwaD
    vj7/DEUYRriuvZBpAaWuwKKSJNGVWCpnE7juKWUp2STHOeL8fMx0+o7R6PnK6h8UBDG2bZOmKaZp
    6v66rjFNU0Msvoj2AFWWc7IsZzaLcV1nI0RRlJyenpBlEtOsub1dBrZtG9e1iaII27Z1FQzDwDC+
    AC0CaPPLyxApJVJK6rpGSollWRiGgWVZzOdzAKTcXCWAOAbTNKmqiqqqAEjThH7/mPm8XstXcZyq
    8fit6nS6qtfrq06nu9SascW4rW81btrzl6Fy3VM1Gr1So9ErBajVx1Dvg06n+9XVPVZnZ28A8P1/
    yXPRdO/tr+TtNeYXF56+aFuK4+s1r99a8t4YhsmTJ3/w4YPg/v6OiwuPp0//4uZmpuOPHytevz7n
    6up963gTP3v2N1dX77m5mXF/f0dR3Glz2PA5rqqCIJjq8zyXmr6Jsywhz+XG8dUYoNs9oKoKWPg8
    r+2BXq+/1FEUeRvjo9TtHqz1pWkMKy8iDQFwcjL8aeM2RZHfhK0VWAP5D7SVP6Ot6RMy8QCyCO4u
    8wAAAABJRU5ErkJggg==` },
    { name: "7", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAASJJREFUWIXt
    k6FuwzAURU8lg8IAg4GAgoGAgEKDgsCBfIDBwODAwEA/o2CfMJgPCAgsKAgsKAgYGDAICCgItJSB
    yFuqRNoalc0H2bHeO1cvNng8Ho/nv7OYWdfdoMfs4i4PBSIAe4bU2Kk+3UTdpFdcKy9iwf3rCvNe
    QwCYdiSVOuFJp1TGAKBVAkBW7ikPR5ps37kQw+S/paaIBctg+b0XUtB+tDycLFL3kqF4KHcBHPnL
    G8DCTaCTOkFt1n3CshrJpYp4BJqyQqro5yCG9HlNvssAqDb9Ot3q/tsW8l2GVNFk36smAOD+v1QB
    dXEmFbKfRiixprkI7HBiEUrs4XThnnUJs8FGD09Wd4hQThZZ08BnPXLe+hn++fZ7PB6Px+P4AtMA
    XYRWrJIOAAAAAElFTkSuQmCC` },
    { name: "70", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAs5JREFUWIXt
    liFw4kAYhb/cnIhAIFYgIisREQhEJQKBqKxAIBAVyApExYkKBDKiAoFAVFQgKhARCEQEAoGoQK5A
    RCBWxOUEbC6bhhSYIm6mbyaT7O6ffW/f7v8n8IMf/IeID1e27yL8Opd8IwQT204LiXu954tF/D73
    hUApAMrlCgDj8TQZ87ynGLCuIUCvzmpHUazJNZRSNBqNi0ScsgVZ2xOMx1PUwRGlFPV6nXO346Qz
    kLa9XK6w221ZLJYAlEolI/ZcEUVWxakYw/bFYslmI41g7UQURdi2TRAEeN7TVxxHHThqe5pck2po
    8iiKsk4cdeOYungjBIFS9OwyALvdlvVastlIwjBECEEYhkWLA2C1WvHw0KFadXL5jjlg3YRhQg4k
    5AD23hmEELkvp4W5rsvLy5j1WkKOE4VnQO+7tv2UFeeJEUKwWq1wXZdut2XwFgpYryVBsCqcHMBx
    HKSUDAZ9+v1BoSAppXE4i9LQqladhCTvLoRACMHb2xtBEBydSKkouTuOY6TpV3XA6vc7hSLCMGQ+
    nzKf/yvJUsrEEaUiSiXbuJ/qQKKy3+98EQbD4Si3P0v+/PxgzF30LYjvH98BuL8VjMdj6vW6EaCt
    BXh87CZ9k4n3KSYde9gCPO8pPvlzbN+0CIIApaLkSqPX+2M8t9s92u0eu52ZOdNpoMkBrLwsiHXg
    7a1rDGy35mSbjaRUsguFb7chlYpInvW34+6unisg1sS9gV848SV4HbaA/eLyBCTkg4G3Lx5hfqX7
    JiGfs0Cv3HVdajWX4K0P0sfhA6Sf2y4aS7cBHD5wRcjhcH+qA5YQNq/DFu+riNFsX/f1n06328lt
    F41l281mg1rNPFfZLLAAS+8VgO/7NJsNZjM/t100lm2PZpLRTBpbYJyBjBht1bchvbADkkMYNxrt
    pDebu9fCcjnLdyAt5lrw/QkcKUSGmCvCAvgL4C2qG55mZeMAAAAASUVORK5CYII=` },
    { name: "71", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA1lJREFUWIXt
    li2M20gYhp/sFUSVQVQZRCeDAAOrWq0MAlangAKDgICCAoMFURVVBwoCDBYEbKUFC4JOBgFRFRAQ
    UHQyWFUGBwKiKqoMDKzKqqKTgYFVBSwwmwNp3Px4vberZlFf8s2Mx/M+882PDb/0S8UShzY4KjL3
    /ejgEEUAOI7LY0AUSfR6A+H7kdiBeFQgYVn9TYg8oMeDMM2uMM2uSJL08SHa7XPh+5GwrP5Pgyjc
    hLtK05TJxKHdNlFVjbdvzzO4hwKU7tlfmGYXXddptQwmE4coWnB2ZmIY+kPGu595rzcQ3yHEeOwK
    34+E63rZ5jykeQZhWf0Mot0+F5p2Kl6+/FOMx+6DIO5KWe6Avd6ANL2h2TSw7QGqquI4H7Dtwb2X
    oqijSJJ0qyEMFwDc3ER0Ol0URUPXdVzXwbYHGUy/b/2f8QF4cpt5o/GKRuPFVqNtD5CkclZXFCUr
    D4cjkiShUqlwdTWiXtcxDF3cBZEHIIZDhyAIACiXpb0OcbyKURTheTNkWSFNf2TLdV3qdT0bb+PV
    PZjdhr20b2q9BJIk0WjUse0xrusym/0DwHS6iuvMnZ6+oN+/AMCyLhiNrvY8f7vNPI4TptPPSNJT
    wvAz8JRv377y7NnvXF72CUOf16/fcHJyzKdPHh8//o3nTYnjf3n+/A++fPnK+/d/4XkBcZxwcnLM
    0VEFz5teAO/WPuubULiuSxwn3wdJCMMIXdcAqFZ/xMvLPkmSbHAn+P50oy7fmkFZlhkOHdhYlvUe
    KBmGIUyzS7lcJk0dZFlmMkmQZXnLMEkSlssky9KOBQCLRbQFGMdQra6eBUHAcOjQ6bQEUNrbA43G
    K4CdWf08Vas1LKtHp9MCKO1+jErT6QdUVaVarVGraXQ6Fs2mCUC9buzFvLa8WKtpuUB5X8PSaHRF
    uVxGlhU0TeP6egLAfO5msdk0mc/d3LbdvkUAhTehpp0Cq+O0XC4JAm+rrOun2T2gKAqeN0NRVGRZ
    xvNmSFIFVdXwvBlxvGC5jPe8i/4HSkGwelFRarRaLYCtsqquZqXrOoZh7JWPj1flHfPS5sT3NuFm
    pV5vAhCGXgHn3VLV7FZkPr/efLR1CoRhnAFkx+zQms+v8zOwBjmkXHcMOffAFsiBVQL4D216o74h
    Ny4TAAAAAElFTkSuQmCC` },
    { name: "72", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAThJREFUWIXt
    UyFywzAQ3OkLAvMEwwCDgIACg0CDgoCAwICAgoA+oMCgTwgIyBMK9QDDwMA8oH+4kqxHOutk1yWd
    jnZGs9JJc7t3koCMjIyMjIyMjH8AGeAkniYk9Fna9gYAcrk4AJCmOcOPjzERiB+PHwJATqfPJDfN
    WWjifv8SAOKcC9bMZRRgi69WL0kuyzWrF+eugbg2OJvN5dEhASCbzatvqm9iiGmSif25xW17C5hm
    LBOmOVbnJ2TlWoTXwHXk6qaJswOHw3vXAc65Z/Fu9zZNvK73AkCKYtnjWCzFU9ovRbHsHs9i8dz7
    BayQe/rMrzughfjy63rfdYcxivpnfFZjWJxfjqxfeCxmcVmugzHGhFTVVqpqK5xrU9qgxczDHGM7
    AHW4ZyYWs/inwilDPsdiFv89fAMPiaN9xUwQPwAAAABJRU5ErkJggg==` },
    { name: "73", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAc5JREFUWIXt
    lC1z20AQhp92Ag4YCAgECBgY+CcIBBoaBBgYFPgHBBQYGBQaFBQUBAYYGAgIBAgYCBgYCBoEHBAQ
    WHjAQOCYChzdWNbICegE6ZnRaG9nb9+9vQ/o6enp6enppvoKke9d4vNl0lVEdePronPOt1uT5suE
    6M+04UzTlKKwRFFEFL2w2x0QEbTWbDa/Aa5zVovFislk4hxZliEirFY/28HXVbx3AmUOWGtRSiEi
    TjyOY5RSWGvxPK8uosHbm1CWpRsnyR6A4TBoFFC3HYBjsiYIRoThg/OJFOR5jogmimKXyNpzcqUG
    7PcpYRgyHo9RSgFwfw/gUxTnTllr0VoDcFeLZ5nmb5xzTNb4fsBstnDCp5NBRPA8j9fXLbvdoSFc
    i1/b1lqKQjgeS5QaYG3pxMPwgdPJcAdU2216XmG2YTqdueD6f8nj4w+sLRHJW60OghGj0RgArTUi
    AoAxBoA03brY2q63oHp6Wl+sQDnbGIPv+1hrMcaglCLP2+LnAgJ3HkSEwyG+Dmkd+tYZMMfIJatF
    4bwNQTBEpGi0u4t38Vu3rFGAu3KLxQqAwWDA8/OvD4U+kftDqvkyuXxIPvOw/He+VKynp6fnkn+x
    efPAnDlwSgAAAABJRU5ErkJggg==` },
    { name: "74", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAQlJREFUWIXt
    lKESgzAMhn/uJvYAFTwGElExUYlAIBATiMlKBA8wObkHQCIRyIpJ5CQPMImcZ4LRwUpv3HGHWT6V
    Jmn+JPQACIIgiH/H2VCrm9PeooEOAMqynjjD0AcAZ7em6BIG4aZptK8ocm1/b2BR4TitPjZnhkDb
    trP3GGMoihz3+01rjxvopDxDCKEdnHvvKZRRbBCs635C3/eNnCyTk7vX6wUAIGWK0ykAAMfYAOeR
    PjwevUgUJQCAJIkNEddlhi8Mj3g++y0IESDLpI4xth9M6yP8+Rk872CNvddrzRuv39aAjS5N+xUq
    VUGIQAeU+ryJL4G5YRzrYUkTC3K2/LcQBEEQ63kBkgNMrKTOjLYAAAAASUVORK5CYII=` },
    { name: "75", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAR9JREFUWIXt
    kyFywzAQRV9mCgwCBX0AQUEDgwDDAh+gICCgBwjwEQwKCwoCfASBwkCDQIHAwoACgwADMwVk7Klj
    NXVTtyV6cGf192ulDx6Px+Px/DOzCTTsSB3rmv1TA1brHWkafaVlN5vXXmG1ugeYXR66dDkJWu8G
    tdb03cfhSfKAUgqlFMaYUeJxHDvrZVkipQRgPg8+O27bDXQrMsYQBAFCCOq6YbGIum6l5FUzef4M
    QNM01HWNEAKAqqoGvVJKhBC9d7Np+jhoDMPQuY39vhzUjsf3qwYBttuzVpIoYPhxrKs5yzIOhzen
    YBQlAGj94tJz0c4YlQK7Xj85V9iidQF0t/92qm7Jb4/lMgOgKPKbDEyB5Zfi6/F4PH/CCUD1VP8p
    FUYaAAAAAElFTkSuQmCC` },
    { name: "76", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAARNJREFUWIXt
    k6tuwzAUhr9NAwaBAQUGBgWDe4jBwoDCgT6CYWBAQB4hIKCPEBgwEBBYGDBgYGgQOJaRJmp6Wdpp
    UrXJn2TZPpf/HB3Z4PF4PB7PH6P/JY1h8XhLotbZXBNzvj5NC7TOGLSerhXI85LNZvVtnDEOpcKz
    vjQtkFIC4Jwb7Q+Hxbfb6mL7y6U8sQVBsN8Fdb0DoKoqpFQAKCURQoy5i0U4yVcqZJhAv9Yl5e4T
    gNWLmAQWRXFS3NqPyT2OEwCa5p0oesNag7WGruvGGGPa8fz8qoGjCax1CYBw9Wg8FJgjiiKSJKZt
    m6vi87ycNAA3vPL9IyLL9Dn3se4lfvSreq2zyVe6B3cr7PF4PP+PL9fyW5xn6nTCAAAAAElFTkSu
    QmCC` },
    { name: "77", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA8JJREFUWIWt
    ly904zgQxn+9d6BggUGAgUBAgEGAwQKDgoIDBoYGAQcMAg4UHAg4YHDAMDDgQIBBQEHAggKDgoKC
    QIMCg4AAA4OCgIIwH0g1lZI0f7Y77/k9WRrp+zSjmZGuuFzaM/WufpmSCe44LpPJDICHckMxHcqg
    2X8/js5a/xICrecFADTNSjqL4knaSZLImOt2qarFSYzfLgHP85woiplMZkwmM1y3y3JZi1Ke59ak
    d8JHXfb7ueBafN+Xtt5tGN5Kn+t2SdOMXk+RJAmeF1BVi5ZPLHHKArLzNM1IkoReT9HrKVEoy5Ki
    eJJPS5Ikexa5VFrPC9rZ7LH1vKBdLKo2Sf6RtuO47c1NLO3Z7LF1HLd1HNea53lBy/mRs09gsahk
    sdnssR2NxrLwYPC3gJqfqX+KwLETKr7P85zlsibLUhn0/e1YXde8vDzvTdYhmWXp0Wg4SaBpVrhu
    l6ZZEYYDiuKebtfD83yUUkJCE5lMZtzd/SmLrNfNUZzPDqHsfjgcyWkvivs9xbquUUoRBAH9/o0F
    DqdD8WgUpGmG7/sMhyPCcCD9q1WFUoq6/sgBdV3z9vYKILrmnJ8ioMX3t+Y2F5xOxyilxA1KKVar
    SsbDcEAURaRpdtQKuwRaDPOXZblHwnW79Ps3QsIkpPsBoigy2vGnJMxM2HpeQBTFPDzMaZoVDw9z
    AOI4YrmsJQuaYJpEv38j0aCtAkji0mt9RqD1vIDJ5D8Arq+/AbDZvFkkTPkw/eDdWgtx0XQ6Zjgc
    EceRlaYPiRkeVs6Hremur78xn+cEwS0/fuQA3N39y+1t8N7+S/R1btiNlvW6wXHcgyG5G5+Wj3YJ
    6XAcDkdiJU0EII7Dg7t8Bz6Ieeo+IIQcx5VO1+0aoIk1YT7PxZVgWwjYy4rnXkhaTcA86S8vzxYZ
    Ldp1YFtIEzJJXEwA4Pv3P+h0OhTFvfhXp+lDhEwrzee5ReCiC0maZsC2wHQ6nYPKWqcsS6bTMet1
    w9yIwJ9xQet5gbUwIOFZVQs5H8PhSCb5vm9WQlMszHPvhBY4bP1sym7eL8uSTkcS0pXxWXI2ARMc
    sAqR9rvZBxAE9gE8JBdZwATfBdP/u2NfKsdfkV2Cv4zAoYWrasHb26s1ZhakY3JOGAIfpz6KYuq6
    5vW1tl5IpiilrFL9FQLyLtAvoCxLiaKYstwePp3nN5sNq9UzQTBiOh3LpbTXU4ThLet1c/BxcrIW
    6DuCFnNnO9XNusTC1lq+7zMeZ5Tl00G8sxKRmYaPVTZ2ile36wF8Cg7wPztR9gCEEolBAAAAAElF
    TkSuQmCC` },
    { name: "78", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABBNJREFUWIWt
    lz9o61YUxn957aChBA2liHKHUEy4QwcROohHCR08mCIyefAYHho6vCGDpmIKBQ8dMmTI8AYNImTI
    kFGDKSY83lA0aiqieMhwBxNCCZlMKVUH694nWbaslB4wNvpzv+9+5zv3HO/x8ig6Prf3vz1UBbdt
    h0EQ4bsWSbZkGgXm5uXlNQBJtuTm3P8v67eDS+kVUnqFbTvFKEwK23aKNM2LUZgUaZqbe7btFFJ6
    BR3U6sqwkNIjjmMubudm95tCK+I4BwDkedqK86orOFAD910LAN+1DOg0ChgEEYMgIo5jAMp3tyrx
    yS7wUZjwy49vuP/7a7JkwvP+a86GPa7uHphGAf98+T29oxPOhj0erW8Nqau7B5zDYxZ/fODxUQH8
    3GGzjZ0X19czk+NRmBRSeib/ozCp/db5H4VJcX09M8+2KbAzBVpuLb/rj8mSCYMgAjUzsutvrUCS
    Lc2zbdFmQpN71x+bRbNkguuPQc1A9AEaJKZR0LkkdxJYLO5xnIMaaD47R/ZDBDkAColKY4R32jgf
    np4WrTjbUmB2HwQhi8X9akHRZxoFyH4IarYCRiLIEd4pKo0NuE7Hripo9cB4PEEhCYKQwWBUkxjR
    XylSEkHNEN7pRk+0xTZpCim9Wu6BlemmNw0AQY5CfrxW8YeObT5YV6CgIr8gN+C+a4Ho4zgHqDQ2
    JBrgldCHlSBnFCZ6/VpUD6JCSo/+6Tucw2Ocw2M+JO/45vAL3gw9ru4e8F2L5/3X/Da9xPrrT45O
    fuKZz2uy945OYP8ro9zZsMevv78iSyYbD6S9KrjrjwkGgmiq6FmK+VKQJRN8f8hw6HNxO6/TV7PV
    t+hvLM+zYY+L23lrRegU7JVNg7dvfwDg9jZGkOP6YxTSgE+jgJ6lAAiC00audUyjwLzz9LTYash1
    U9RyNAoTszOzQ1Y5tazPmC+FUUyDrh9IgyDSBtyIuasdG0KliWqhSel0Va9pYlXiWTJptOfO84Bt
    OwANKdcBXH9sKkMTq6q0TqLLPFADNiNYacA8T1fX1MykSiHJkokxsTY1YMi+JGptuNpmbdsp9P31
    Fq0/lG1dr8Gaz7qkYOOpqOW+OfcZhYkxXLVBAesGbGB+2lUGDa4BqPT6KrgGrv5u22gnD7j+mCzL
    6ouWOQfM+b8Obsi2RCcC2ljVxZVSRoEsmTS6o35uWw94EYEacKX1VkOl8YpESUST2DWSdU6BkbQ8
    61UamxTkeWoGEn1fE95Vdp2rQBMR5CilzHRUNhhc9zszKQkhTIuG9rFslwKmBHUZKiRCiI+TcRnL
    5dJMSlF0ju9a5k9KeYpu9MHOXiClh+8PAaplBTSmHDPEDoLItHHXdVsn404p0H0AjJzb3je7tG2H
    g4MV4Sx7vxXrXyH1qyicckJSAAAAAElFTkSuQmCC` },
    { name: "79", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABKpJREFUWIXt
    lj9o41Ycxz9J36BBFFEeRUMGDR5E8RBKKOHw4EGDhw7hyJBBgykeMoSSIZSjZMiQIUOGGzJ4yBCK
    Bk8llFJMMcWDhgzmMEWDB1NEMUWDBlE0aBB9HWTJ1tnXa7r2fvBA773fn6++vz8SfJAP8kH+77Lz
    H+3UM/ys627oPReAApBAY1+jeSzx7zJmUbzNlwLo95os4oxwHuMFyYbecwAoCUhT0r3dw7IkYRgD
    8HCxeBuE8i5s3NsZAG7ToNMxGQ6jDRDi3wa/6TaxembhsO3jjVtYlmQ0nm01mM1z3KaBFyR4QYKu
    a3Q6hb0XJOo5L6/6l6YSOuryqKFsU6qB76gbb18JoanDfU3ZplTUc60ujxrKu7DLcwWo00Nz/exZ
    DLAnLW5Gc8g03LaP7eR44zZu26chN/XDeQxIvAub4TACoP8U4bQbNb130fA2RRXi/qVZHZ7dJBh5
    hjRlWQM1cZsG1hKd3Vi9a/d1SJ5nADtbK3fgO5y0RtsAqvWXjS0TO8uZxykAvQODVsuo7n0/of8U
    4TYNRJLyo55zd+/gtv0KQM25d2Ert2kooaMGvrOR1xtvXw18p1qdU0MJoakbb7+W6/XlNo0q70Jo
    6tw1qvoB1G7p/PRwRS2ZRslE6WjgO9xeT2t0dN0Drh9sxn5YHu28vbwgqdoRwOxYeF5Q7UsAtFoG
    w2HEIExoSB237VcgBr7DU3/C3b1TGY7GM07cgHkYM+xvDpg1FgAQQuPsRKsuyxTsrlt4QUIuCyZK
    EGEY8+BNmOkrvRM3oGFJej3B/eWiDF6jvgQu7Xrw2+sps9GqIDfa0M7y6rkhdS67BX3euFXTm4cx
    DUsCCwDVPdLpXBxW91fHU1pnGnf3DlfHU7xJ0SVlEW6Tash0Tg3VOTWUbUplm1I5UqsKD8tUN95+
    rfB613uV3fq+HFAD31FCaGq66Cppr/aA+qgMDnA3fMHV8ZRktoth/1WtX96kfN76mMn0d379+Q/e
    DCJ+eAMYOgY6X3/7GQ/ehPBRcDd8wXcXC/JPE776pknw059YXwhe2jm904jd7BO03yQvLzVG30er
    FAz8gqpZFCOExtzLqm5AW1Hea+bMUp3Oq6IoLKs+BsMwpuPkPNzmOG1IMHi8nTEJ4O4VXN3rPE7m
    nJ8U9rUiLMUbt2jociP38zAm/1LQOdBqgUfjGSMvoXWmMfZDRnHK3mFcfS2fphl5nnF6HXHVK4ZW
    2brv/RY89Sc0dMliURi2WxZYRdCHq5izE417L6F7pPNwFZPnGWLZMZEMKf4egGWnTLQipJ3C8F0A
    nvoTQJDnGdZCAhnDfoIQGpPxFNMSyIXFQROegqxgapSCtnKYF3iJ03nNtz5LAQ1roQPJCkAZFFhe
    Fo6jOK3O8zwjnkGyyIGVY6EDmVYOl0qshU6eJuVWrXyvRKwrl0HX5T5IkGZBo2U1txH2D5IgAVPb
    vDkfFwNsawoGkwh0AwnoSw0JhGHAes2bGqTLuZXmdR8xcB4uYQgwUkh0eO0v0IB9YAqq+odzpMY4
    y9jLVkGjrHAk6qwBqxxvE7kEUIolwMjBXPoRKQgDHpMtPx3Pp/n9EobBu652/ga1vEj7r3hPfQAA
    AABJRU5ErkJggg==` },
    { name: "8", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAjBJREFUWIXt
    lStz20AUhT93FgQICAgILDAIMFhQaCAQUGBgUCAgEFBYYBCgHxEgEBBQWBAgEBBgIGggYBBQIGAo
    sEBAwEAgQDMqkLWJH0ntOEH1mdGM9nXPuY+9CyeccML/jt4H2Wnea/9YAQ2ACn36fclASgAWWjNP
    /1DGs39yHSOgUaHPyBuy0Jo812uLnaANMVt87xVgyG+i3wDUaba1SXiKwXBAvy/Jc00W3R/D+Ux+
    9/jQhA9RQ99thKca2lS8+anQb1Tod2ODL4cQr8iJ5zOiq4hxGBjPYyBRgsW1ZOZZxM/netCmZBf2
    FdA4wQV3jw9cx3dmchq1NIkSuJ7FmX1GMV0iHIGtBIkSnfDedHKz0/Br+VgLk/CU+R8F3wz5OAy4
    nNzgepZZnwxHJue384QirQieuZpNzl0CTIEl6dxMLuYLrsIfAHyV51z6PxHSwZaO2bPUJbZ0WOoS
    AFs6/JrO8KvXnd0rAvTdteE4DEwU4rzA9SyKtEJ+t7kopYnS5Srsh0ZgpyDhKeOdLR3K+QLle2TR
    PYkSbf7TCtezeFo+UeU1dbVOrkJ/6yruW4S9Os0MeYfsPgVglNUUaYUlBcIRWOfWFvn49mqnYbGn
    gE5EU9K2XoYDlrqkzgtgRaZr0MvNcw2w1SmN0QMErBlVoU+hS1Nwb3XCDrs64VFvgRNc4L5ISbES
    080VusSVDoUuP/wtMCKg9fRlbUB7JTei8uGv4ZaQT7R/wgknfB7+ArgF9CCMKmfxAAAAAElFTkSu
    QmCC` },
    { name: "80", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAvtJREFUWIXF
    lyFwo0AUhr/enEBUICIQiIoIRMWKioiIiIgIREVERGTFiYoTyMpIREVERSQCUXEiIgJRURGJqKhA
    VCAQEciKzuwJyhbSEDZtbu7NIIC37//z7//eEvjPcXKEGvI7db9LQF5cjAB4e3vl7u6OJEmZTofa
    tX98F3w+v2U+v8VxBADdrk0QRLBbmaMSoNt16PWKa7UKSZL0YBKHEpCVC4D1+rmWcCiJn4eAb4P1
    eg62bX9KLEkACDEgjh8kDZ7QVUAGQUSSpLVLiAGLhY9pWuR5VlsQxzEAw6G7t7COAvJdSlX0A+SB
    yeQ3AKtViGV1yLJNjYQQYm9xLQVmsxum0yFpmpKmaWPeeDzCsjoACnib9Hbo9KoEME1LPcjzDMfp
    kWUvSvrq+/v7FVm2YblcYts2vu81YrUpICfe8hM4wPPzmjzP6PfH9Ptj8jzj/Lxf88I+tcpoU0B6
    nq9uhBDllFNRkqsqMRpNFLht24ThbSNmK4HLy1/qxjAMXNdV+/ouLcPhlOvrazabDwN63hVXV8X7
    JElwXZcwDImioIar7QEhBry+vqqH5f57nq+IlGSNbnPrhb57MAFFoiQC8PJSH0qlH56eHj8934qD
    tqBGwvvjw2NhrjC8rZnTss5w3TEAUbQkjh+0MLQnoecV4ABxvC7MdrWo/cLl8h4opl+pVFtoeSAI
    ImW8xaLoigrwCSBN08KyzgBw3TFCCHx/VirRiKN1GHW7xYEzm93sAgc4yfNMQrEVQgi15hghHacn
    HacnTdOSpmnVjuPtXNO0VO7EW+7LBTQVMAxDmapqvKbodGwMw+A58ltztQg4juD0tDhkNpt0V2up
    KH1QfqJVumFnHPRFtNnUZnujtFt5xyFQFs2yl7155Xudg0ibQByvtcDhYwsOUaEtZL8/lrw7vHQ5
    u7dA5VVytD7PG8GDIKq1YUvRGtEgiKQQgy+TUAWEGFR7uq2YWiPEoJVE04iU1Vmue7BU1wPsqPFp
    /b6CVcZf/Q95jBr/Nv4CXxaCvrXwO6MAAAAASUVORK5CYII=` },
    { name: "81", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAwxJREFUWIXt
    lyt020oQhj/fc0FAgUGAgUBAgEDBQAEDA0FBAwEDg4CAAoOFgYECAQEGAgUCAoYLAgQKCgQXFBgY
    BAgYCAQEiO0FthQ7L8tKeks65+w5+5x/dh7/SvBX/rD0PkmP7ar3nw8ANi3Pl9RNZPSaQW/Kv13A
    83zZDC4vL1mtCr59m3RQ1S0EdntLlLoCIIquUeoKrTUAaXrTWv+xIbB5vkSpK5S6IoquMcY0i0EQ
    YEyOyIgkyeCIULQFtyKjpiVJ9mLc7w9sGM6syKjOkXflmBBYkRHz+ZzVqgDYeuAHYTgD4O4uZTA4
    Q8QDYLk0GPPjXcy2BliREff3S87OXGATf2MMRVHsbUzTG8JwRpre0O8Pmv1JkrBel/i+7OG2NiBJ
    MiYTn+FwDMDjY8mXL6d7m37+XADguh7LZQ5AHGs8T7j+bkij4BjMFwbYJMn26r/fH9jhcGyHw7EF
    bKi0BWwcaxvHutmzu/ZccesqqLM9STKUihpPON6U1coQxxrf3dx4Pr/l4iKg3x/w8LAmVJo0CgiV
    5jUjWntBqcgmSWbzfGmViixgf/0qbKj07g0343C2P96uP/dEWya0IiPyPG8mxuMAgK9fnZe7i6wm
    o14NVsc/jQK79YgFeq2TMI43LHd7G+0lX1kWrNf3PDysn5+pddeAe3N1/ygeqDuu6zWTp6cOZVnU
    Wf+WPvvWWtfn2IbhDMdxKMuSqqowJj9kxKty9FtAHdOnB4eyLBHxas8cleVtrG0UKhU1k1mmqaoK
    xzlnOp1yfu4wnU6P9sKhKrCu6xEE4xcLm0QsG/DFQrfFbG2A3T6paK1xHGeP9x8fS3x/U4qLhUbr
    RaccOMgDUXSN6woFLsZsuP7k5ATfDxARtNadE/CgATX93t2lQNrMX1woRGS7pzv4oUO2Tro4jhqi
    ERlRVdW27+0yXid5rwx7UaQAavAeQFVViHiIeBiTv3O8nbQtwx475PPkfsPWyN/igedG9tL0hqIo
    mtyoDfmIdPoshydSEhEmE7+rrg/9mu1S7mf94v3/8h/rx5dcWy9yVgAAAABJRU5ErkJggg==` },
    { name: "82", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAydJREFUWIXd
    l69z+lgUxT/srEBUPBERERERgUBEICIQFREREQhEBCICsaKiArF/QCWiIqICgUAgVlREIBArKiIq
    IhARX4GIQEREIOKygvIGyo8mtLtizwzDTN6Pc969596XwP8A5cfvJjS+S27bAwCWy9lP7FeP3PMe
    yyhKytFoXNr24KZI/PYNclzXBaDfd2/cpl7Ijk4nhHo02OnYN6Xh96rky2XM3V2TX79SAB4edrkf
    DkeYpsl0Oq3DK3EpBYenLaMoYTgcsN0WGIaGqioAOI7HZDImjmMAdL39ee1NAsqP8JZ7cse55+np
    WYrYk+8xmYx5f19iWXZtEZ8F7MkRQmUyCXGce4JgxsPDAMMw6fcd+n0HANd1abe7J4Lq4LNhpADH
    8Vgs5nKg07F5f18CSFLLskjTnScWizmO4xFFS9br1bm9KwmQIhzHw3VdwjA8EqKqOoqiURRbDKNF
    HEcAbDZrOUcIpbKIiwIAgmCGYWg8P7+Qpimr1Zuc1G53KYotzeadfL5Pw2IxJ883lQScK8NGnm9K
    gDAMgV2u9073fR9FUfD93snCNE3RNE165mOfqyIulWEDaMznz6RpShiGmKaJpmmMRkMAxuPJyaLV
    6k16oiq+asWNt7e/pAhN0wDw/R7j8ZMU0W53pTEP0/STKIVQSyHU0vMeSyHU0vf/lP+TSXg0Ro0r
    umrfLoVQUVUd07QAiOPoyPnT6Su+35PlW9WEt96GAHsS2u3uiSkPuulVVI6AqhoIoVAUW/nwo9YR
    Qj3xQBDMGAzsLzmq3oYAmKaFbdsAvLwEstnk+aY8NF8QzGTZfoVaKdA0jfU6Zb1OMYzW4VAjzzcI
    oeA4HnEcE0XRzwtoNu8AyPOMJDl/Qk3TavWC2ibM84wsy+ou+74AVdXI8x1xksTE8d/wyWCWZf97
    AhRl1wWvnX4f/joRqlUFSZKQZfV6/Y8JyLKU9ToBQNdbF+elacp2m8m5X6FyI/K8RxRl9zI6mwXn
    Wm0phIqut+h2bSnm9fXlKk9lDxRFIcur0zlvtvv7HrreYjYL5Nxe7w+40pJv/jC5sPYS0X/6zVgL
    /wBsnGvq5DopPQAAAABJRU5ErkJggg==` },
    { name: "83", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAmNJREFUWIXt
    liFzo1AUhb/uRFRUICIQCGRERGXE+wERKyoiEBWIihUVFRH9ERH7A5ARiBUrEIhIBKICgUAgViAi
    IhAVKzpzV6QwJIXkkaQ7szN7ZiLIvbnn3HPvewT+4x+HnFvgyznkcZydLeLqVPL5fEFRFFiWxWIx
    76rVFHcqV7uA0Wgirz8XMhpNZI+oehbXfRbPC8R1n/dzagz6Ejcf8jQly+KdmOs+o5QiiiLSNCFN
    E15eQuhwoI8tEscZeV4QBAEAvv8dpWYURVYnXV/fcHNjAFTEB3l0HajJm/C8rZD5/IHxWAEQRT+a
    KRebe3PWAojnBQKIYZgCiFIzUWomjvPUOe826BxDMQwTgLu7b8C284eHr3heUHeephGWZWFZFo7z
    hK6IYxYJwHK5qr94fLynLNcYhrlD/vpa8vb2G8d5wrIs4jiuxnGQ49AO7JBXiwdQOZKmEQCmaZNl
    MYPBNWHo18J0cEidGIaJadrc3k4IQ78OTKcOYegznToAhKFPWa771tdKqOcP1Nbvo3JAh3Afx5bw
    qizXVJ998sqB9fpXX15tAbDt6gq2nVYoy/XOWD5TAOyNAraL2Jz7e7z3m7HXu6Cyum3hOpbwKLT/
    D7R0+9cggCyXK1kuV6LUrHnVim2P6xgnjEDLgarjIAjqy6eJ5iXVFzrn9sNd0Pid2PaYsty0xbSg
    5cB06tRnvit+f//Yh7efgOFweFLxiwkAyPPsJIsvIiBJkkty9hIgSs2OFglDn81mw3tur6N41AHX
    dcnzhKLIO3NM06YoClzXZTSa9BKhdQyP5LeRXXRPPhV/AHl1EKHy6aMhAAAAAElFTkSuQmCC` },
    { name: "84", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAh5JREFUWIXt
    lyGX2kAUhb/2VCAiEBERESNGVEQgVkSsqECsQEQgViCQlQgkP6ACgUBUICIQKyoqEBXIFYgVK1Yg
    IiIQI0ZERCB6zlSwBGjpNhNYzmlPrxomj3s/XiYPgP/6B2RK7h3V21PDP3WDnwPNZDIrDXEKgOk1
    fZy6Q6/pbwPNZDJjtIxPsLWEiKPA7IWboN/evi6lU29Boclkxq27PJfdiyo+8bgXmqZbM4NImvzr
    0MRRsN+RUrLtgBn3QqbTOeNeiEo1UtYRrRHh/YJcOCyUtjK0ATCDSAKw/PIRAE+4BKEoClSqCUJB
    063BazwFTr12EPa0SKkFA0bLGC+eoVWOSjVRp1Ea4p0NQJ6ti7VWOUEoinCAJMmK61LWmWv1R0+r
    DnjCJc/WLO5Xu73n8E3gmiTJ0Crn80IBvDkrgEo1nnCJOg1cz0GlGtVtHdTM9bp0eOmiPZlBJPGE
    C0D3Q5ug3S8upt/tPW0BAEwnqPN40wQgSh4BmM6SSgBnm4SZ41V6X6UObOdBmmyGjpAueb5mNF9Z
    e1buwPYcCOkW6yo62y24KIAnXJKn3SxQqd38Pxkgz3Jk4B8AXRhgM5KF3AU7Tu135S+qylMAYG77
    s4ONu2Grkt/feQgBVov46PpiAOfS2QCE+OX/wasAGMBcX7fRejMH7oYt/LCL77+vBGFzas3V1Q0A
    yfM34DFJ2eDh4Vtpb+vfAyXrSvv+ALIzy5Gz6dnqAAAAAElFTkSuQmCC` },
    { name: "85", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAulJREFUWIXt
    liFw2zAUhr/uCgwMCgIKAgoKBAYEDQIGDAYMAgYCAgYCCgYKDAIKBgIGDA0KAgoKCgoEAgYMCgIM
    DQIMAgwCAgwKDMo0kNqTE7tJC3q7W/+73PlJT+//9d6TFPjABz7wD0K/J9mnbXKl4lLEuwg52iaf
    z+fVQBD4TX5taBK8d92xaZTkJbHvB6VdBm8LqKMo2Rl0XakPEVELBGjfD7TvB7rNNnxLch1FiRbC
    0UI4uhybTmdvLmUjsVKxVirWgHbdYUUkhKPz/Knxt0/AvvRogOfGpN93yLK8mhyNLlmtlsznD/R6
    X5De1d+5r12kFHQ61os8h9anEnJ3d8dgMEDKcwBs294hT2YT5vOHveSwewxboVRMv+8AVOTj8QSl
    oho5QBheHxr2VaiaTKlYC+HoKEp0HKc6ihK9WKz0YrGqGhI4qAmPX5rcwlGaxno6nTEeXxKG10gp
    WC4zbNuiKIrK0XXlixsp48ErSmCi0+li21ZtzLZtiuJp31KtVIxx274qAwDc3NwQBBPOz8+ed28D
    sF5vTkeWrZhOZwCMRh40NKGZrVcL+PnzqiKvB33Cti1GIw8hHNI0LqeqHvD9gKIouL+/f5MAPRhc
    VmnepHyzk9PTDqenHTodCyEcPO9btcjzvtHr9YAye/X3pfVu35rTV1fXnJ116fdd1usc27aq9BdF
    wXqds1yuAIjjmKIoeHx8BECpnWN5tPNhkt3eRgyHbm1w4M8alYZjlx+/opZ9wF3g1WwjdmsGdBQl
    KDXj4uJ7NRjHu69diTRNeXhoFtHtnnFyclLZw+GAMLwus3K03QMaQErB9PeqRvrc0TXk+RNJkhKG
    Aa7rmfU1fD5X31JuesE694BNWcx7QN/eRuT537NsWRZR2ky+yVJ91+X/BxNZtiDLFkjZw/M8pBQA
    9PsXALosgW6r8VuQzCY1e/utMFHrdHPCFLTdSCaEcGokyWxi3gGt/k0CtmEKOtTvrf7/Mf4ADveB
    cXgbYWwAAAAASUVORK5CYII=` },
    { name: "86", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAcZJREFUWIXt
    k6FypEAQhr+9OsEDICJ4gBERI5EIRAQPsAKBiIiIREQgT0Qg7gEQKxCIExHIEZEjEYgRJyKQeYc5
    sWHChmx2l6u6M/xVVA093fN/ND2watWqVatWrfrP2kzW9kj8XNlPYifPGRNslj0A0HWarnu+2L3v
    BwCurnwX833vK89DgKcnDUDTNARBMKsSQhw1D0Pp1iPA/aMCIMBwcxMD8PIycHubHHg7ACmjd7M4
    n5kYVX5qXtf1zHwEeO0a9y6ldB9ijKEsc4DNsRk4W1JGiDinyKSDuH9USP8VAN/fQzXNHkYpB7wB
    +D4569LBs1JG5HkBQJqm1HXtWq+UcokT05nPkmkHsNu8JZEeSim0fma32/Hz12/it1GZ/Osvfb4t
    BHAzcXeXEYaRi3meh+d5VFVLVbUOeAq/1HMqu81bW9fKZtmDFSK0Whu7zVv7ZuCeqmptVb3H+34Y
    138PIWVktTZWa2OljGbmY94UpO+HA4iLB29cbPN9e40qZ9e2a3/s94weQ5uxtu8Hus4AkKbxRQBW
    iBAAmRRnFXwEESJ0tUUmub4OlnVgBDmlDx04qJdJQVMmy6/hmXnHzrcn9lf9O/0B4em+qODATmkA
    AAAASUVORK5CYII=` },
    { name: "87", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAkhJREFUWIXt
    lq1zq0AUxU87EZUVFYgIBGIlIgIRUYGIQFRERFQgIp54ImJFRERFRAQiIqJiRURFRSWiYsUTFUhE
    RUXFikj+h/tEwg6fKXQS3hM9M5ksd2DPj7uHBeBHP/qPRIdfp7pIzYUIAQDTqZetn12X6WC73QIA
    DiCddaJ3+L94e3shALBtG0olMM0bQoedSEXD4ZiECEmppCoTnXSGbPu2CoLe33edBbUKgnx/XteZ
    biCECMn35+T7838DMRiM6PraONYJwhn2Ew0hZUycB3UQxHlASiU0HI5PBkGMObRabYkxh6SMSxAH
    I23e612dvgMpiBBhCYQxh5RKcmFFi2Vos9EQYw44XyAIlthsHgEAltUHAIxGHjxvDMYYkiTBYGDD
    de22Ho0gdCeyd8+YQ5PJjDgPSMqYDMM625NSac55QFH0QZPJjAzDIsOwiPMgF9KqyS6ril+JMRur
    1RoAIGUEABiPPViWCQB4enoBsH+vpOZSykqIXrHQRJ7nwbYtfcz5Auv1PhNxHAHwAQD39+4BMsbD
    w7JyrrYBISFCuK6jC2kHOJ8CAEyTQakPPc4qjv+UPL+TUFIqyRVM86bptSW/tktAADDfRI0NTiG9
    saSpv7v7lRsLEZIQ4UnfA3qyolkRJntuBUhrmJJp0bhoWFdvCpNdM5IyxmbziPV6idlsgSvLO0q7
    +u3U5uE52F+bfm2bZr9ya9af5VLGuihed0eNU/PPz12jc6ejvh4XIXIdqJtgwsMvTbJK775G39oH
    2oap8eP4F3xtvmSNv9VkAAAAAElFTkSuQmCC` },
    { name: "88", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAcxJREFUWIXt
    lqFz2zAYxX/eGQQEGBgGBA4UGAwEBhgaFAYY9A8YCDAoLBg0yJ9QUBAQUCBoYBhQUFAQEGAgUGBg
    ICCgOw8s8ZJrk0hpd9vd8pCte3rv6ZM+2XDBBRf8ZXgfmNt+htaXM43bMghYhyGTTLAOw27cVcw1
    dVsGAQPfZ9jvkwU1eT8CKamUQhrDuGmcdF0qsGdOmvIaz/cIA9+nDAJwqITTFuyap3rE3fU9SOki
    cXaAdrOyDgkZd483AFRKASCNAeCH74NlFZwPYaUUlCWCnOm3WWe+hdTaSe+cLqBarUjImD1Nfxsb
    g9SaalOFPxJA7ogLchKyN+PvvR+Db8nzxk3TPvR60Ot1g0+FBGW6VUtjWPlQbuZYCVtwusM09iHe
    yfwyfeRqdr1nDlDuF+Cox6kAbRynRFHEYnFPmn5nOBwwGkUdQYgCpTRa/zqMWmuEmBOGA4IgpCge
    jvrYbkGHuq5ZLp9dpx2E9RZMMsGqyPkaZ0fJW848T6w8bLrAA7x5ntA0NXotAFgubjvC9lmvBU1T
    b829U+Yn070D2zv+I5/5/wwupXL92fjci2iSCSd32y44eRG5Gh8IctDnn6/AmyAOuLSiFX4Cfoyz
    UTgSHtYAAAAASUVORK5CYII=` },
    { name: "89", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAqtJREFUWIXF
    lyF04kAQhr/eQ0REICIqEBWICEQEAomIOIGoqKhEnKioQCAqKisqEBUIBCKiAlERgahARESsQKyI
    QCAiIhARERUV915OcEmbO6Bs0r7+Krs7O/NnZnZ2Fr4ZJxX2pp+hp+zGtN3+SatlIaVASq+0rh9V
    jF/UfCyrU8ZuJQL5nwNY4WMlArWyGy2rw9NvkEkNiPaJZXlSJdd2Kk1dV6T9/k06nc7TbO5fuZlv
    pzPf3rWWQzUEaRBEBEFEs9mgbwQYhoHrCobDUUaugFNXO6hQhUAaBFtXTyYOk4nD02uHZrNBHMeY
    plmQlXd9AB7rEm/Y20lOlUABw+EVtm0DYBgGAK4rANIwjBmzwDxrfKjnWALp/b3DZrNis1ntFJjP
    5wAsFgs2m7iw1h3NYU8iHu2BbrfDchnx/CxZrVaMRhMAdF3D930AfN9HTxI8TxAve1gNh+lttNe4
    EgEA0zSRUhbmxmMH0zTRNI31es2TCBFC4LqTzPDBI3h0HfA8weVlj+vra8bjMQCtXz2YznEcB03T
    MqMZjjr7RxMQYlv5ej2bWyuh4TwwSxLq3gD7DNZBXoyUio6KcHp+fsWg+Vb1ps9+QeAxSL6WwNow
    mCUJtbspURTR6bewtDbe9IJ1EPGwOJxwu6CShCfNOOZchoVJISQvp1fUrIGK3Rzql1H8VgcsrQ2d
    7VEcj51SBJQr4d1knn8LIdF1jZeX11LGQf2aTAf2W3kN1wlnzXr+7YYvyjqVQ3DaqBcIZONwnaiq
    AkqEQK/r6HX9v7nME19OIIPwwtx4FSiHYJl0t/1gvY2UHqGXNRxNDrRme1HaA+9RpTP+FAJZh/xt
    BKrg20OgkoRpv3+Tuzt7jknppe9J/B0fXYyOFdxp/P26ZXXzgcpbUek6/mBfqdfyH0V4DLLO6HUy
    AAAAAElFTkSuQmCC` },
    { name: "9", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAY1JREFUWIXt
    lK1ywkAYRQ+dFRGIiMgViIoIBBKBQFRURFZEVFZUVCCQFX0ABIIHQEZUVEQgERURFYiKCARiBSKC
    B8hMKsjuBEhaYNqhIncmf/P93LPf7gRq1apV68JqnFmX/VbfcwAybzIAwJWSjrxmoZYAxEoBED6N
    j/Y4FSAbvo0Yj6YHgVv/xkBVwJR6nTWBqoDotQ2I3+0DsFBLYqUqQU6eQCgFwoZ0A55K93tkGkJv
    D0AQzU1CDmJqrk4xn7UFvVkHy7Zotiw+HhzYm8i+OWyn4UqJKyX5+TE1O/TfuYdS0GxZCEewep5y
    f/dImCZ6CgC6OQDR+4IkigFwui5JFOMNfcJRsE1YrQEaGiATvbYpTlUCgJCO+dbvZTmpSvCGvonp
    gwjsbIMxLwEAyBy/D0ASzEunoF5dPl+WeLZLqhKC1Rq/EDf1+cq1NLydP/P+DXMrQniTwcFBKcYL
    a9DmpduoYbQ2KsGWzo55lX76y2WF66g8x+9n3mRwTM2f6KLmBuKS5rVq1ar1v/UFL42WfyiIL+8A
    AAAASUVORK5CYII=` },
    { name: "90", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAe9JREFUWIXt
    liGP20AQhb+rDBYYGBgYLDgQYBBgUGAQUBBQEFBQWHAgIDDgQEF+wMGAgvsBAQcOBAQUGBxYYHAg
    IMDAwGBBgIFBgEEkl1zcWJHarJ1GatUnreSd1b73NJrxLPzHP4DqbbXCTVdx3w8BSJK4Fd+7ruKP
    I5fBftOapIsBAN4PPnS639ZAnfpX9YKy+lc1UBfc/f2MySpnOBwdnxkVpGnRVMtl3AhEUQSAEALf
    9wEYj0dncxtnIFmOyfO8XkEQNMQ3TxMe7vpwZiZMDFRvxGyeJo0D3/dRSp3EL22ggSRJTmJZWvx5
    A1tdEMfbpnCmjYVbG/CkQxh69f62mP/87jnGBoy74OGuz3Kd8unrKwDb1YBUl7iORZLtCV2XeaTP
    5m4zC6rpUGIFUwA+et/JnClKKRy9MBKHlkXoSYf9ek4QBGTOlDzPcfTiOkV4DNu2cV23C0X3YdQV
    VpfLL98+U+72CLs9zUUy4Enz9utkYKuLE9G2JlrlrpBf2Ns263INFpT0sG2bRKyA+Lf3j9F5Fggh
    0PqKv+IDDuM3ihZIKa9v4FL4Ow1Iectut2vEHMdFyp4xl2kXVLPZI1pnpGlaB9M0RWtNGA4AiKJF
    xZkDybgND+JKPR9CN0o9VwBlWSKEMKU0xq+e3sbP8h+bGKx9E9Sh1AAAAABJRU5ErkJggg==` },
    { name: "91", sprite: `data:image/png;base64,
    iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAUtJREFUWIXt
    lSFzwjAYhp/uJiIiEJUTCOQEcnIisgKBmOjPQO4HTFQikYj9AGQlAlmBqKysqEBExHVig6NrkrK7
    MhB97mry5vrk+5KmMDAwMDBwY4IL5tTXdHQtoE7TjLKsADDGkGUZs1mE1gYArXUjU0o1xuNYeT0P
    XXIAKSUAQohTKKX4eSTGGOu4lJLVagOeLj665EVRnSo/vvhY9WTyBEBZVmhtCMPwNO93BiHrdUoc
    qxpLJ2ytqReLpFHVOdttilKRNfdlAMvle8vp6kCj3e1MtsaOUlvmw3U46vH42Rq8zD/I04TDofpT
    VhR7q891CIOi2COEdFY0GoUXZy45eLYACPJ8V0+nrwghrPvq36bvLM93Trk3OOOqF9HN6bwJr+1x
    fgUAb4tNL/bPJHL6rBdRX2LHQhpO37/gX7jLLWgtpAfu+1McuClf+NiGEWZOtRMAAAAASUVORK5C
    YII=` }
];
let unitInfoArray = [
    { id: 0, name: "Grappler", slot: 0, techId: 0 },
    { id: 1, name: "Blow Ship", slot: 1, techId: 0 },
    { id: 2, name: "Spore Ship", slot: 2, techId: 0 },
    { id: 3, name: "Pod Ship", slot: 3, techId: 0 },
    { id: 4, name: "Shroud Weaver", slot: 4, techId: 0 },
    { id: 5, name: "Veil Seeker", slot: 5, techId: 0 },
    { id: 6, name: "Destroyer", slot: 6, techId: 0 },
    { id: 7, name: "Quick Mercy", slot: 7, techId: 0 },
    { id: 8, name: "Deathmate", slot: 8, techId: 0 },
    { id: 9, name: "Vau Carrier", slot: 9, techId: 0 },
    { id: 10, name: "Vau Transport", slot: 10, techId: 0 },
    { id: 11, name: "Stealth Ship", slot: 11, techId: 102 },
    { id: 12, name: "Cadiz Dreadnought", slot: 12, techId: 69 },
    { id: 13, name: "Vlad Cruiser", slot: 13, techId: 70 },
    { id: 14, name: "Destroyer", slot: 14, techId: 71 },
    { id: 15, name: "Frigate", slot: 15, techId: 72 },
    { id: 16, name: "Carrier", slot: 16, techId: 73 },
    { id: 17, name: "Carrier MkII", slot: 16, techId: 74 },
    { id: 18, name: "Space Fighter", slot: 17, techId: 75 },
    { id: 19, name: "Cyber Fighter", slot: 17, techId: 76 },
    { id: 20, name: "Space Torp Bmbr", slot: 18, techId: 77 },
    { id: 21, name: "Martyr Torp Bmbr", slot: 18, techId: 78 },
    { id: 22, name: "Assault Lander", slot: 19, techId: 79 },
    { id: 23, name: "Freighter", slot: 20, techId: 80 },
    { id: 24, name: "Armored Freighter", slot: 20, techId: 80 },
    { id: 25, name: "Bulk Hauler", slot: 21, techId: 81 },
    { id: 26, name: "Armored Bulk Hauler", slot: 21, techId: 81 },
    { id: 27, name: "Starbase", slot: 22, techId: 82 },
    { id: 28, name: "Meson Starbase", slot: 22, techId: 83 },
    { id: 29, name: "Submarine", slot: 23, techId: 0 },
    { id: 30, name: "Battleship", slot: 24, techId: 0 },
    { id: 31, name: "Destroyer", slot: 25, techId: 0 },
    { id: 32, name: "Carrier", slot: 26, techId: 0 },
    { id: 33, name: "Naval Transport", slot: 27, techId: 0 },
    { id: 34, name: "Sceptor", slot: 28, techId: 0 },
    { id: 35, name: "Holy Relic", slot: 29, techId: 0 },
    { id: 36, name: "Vau Fighter", slot: 30, techId: 0 },
    { id: 37, name: "Vau Mandarin", slot: 31, techId: 0 },
    { id: 38, name: "Vau Guard", slot: 32, techId: 0 },
    { id: 39, name: "Vau Jet Bike", slot: 33, techId: 0 },
    { id: 40, name: "Vau War-Skif", slot: 34, techId: 0 },
    { id: 41, name: "Vau War-Tower", slot: 35, techId: 0 },
    { id: 42, name: "Vau Warrior", slot: 36, techId: 0 },
    { id: 43, name: "Vau Worker", slot: 37, techId: 0 },
    { id: 44, name: "Symbiot Spitter", slot: 38, techId: 0 },
    { id: 45, name: "Symbiot Minder", slot: 39, techId: 0 },
    { id: 46, name: "Symbiot Tank", slot: 40, techId: 0 },
    { id: 47, name: "Symbiot Arcer", slot: 41, techId: 0 },
    { id: 48, name: "Symbiot Butcher", slot: 42, techId: 0 },
    { id: 49, name: "Symbiot Reaver", slot: 43, techId: 0 },
    { id: 50, name: "Symbiot Nester", slot: 44, techId: 0 },
    { id: 51, name: "Noble", slot: 45, techId: 0 },
    { id: 52, name: "Blademaster", slot: 45, techId: 84 },
    { id: 53, name: "Warlock", slot: 46, techId: 0 },
    { id: 54, name: "Inquisitor", slot: 47, techId: 0 },
    { id: 55, name: "Dervish", slot: 48, techId: 85 },
    { id: 56, name: "Spy", slot: 49, techId: 0 },
    { id: 57, name: "Assassin", slot: 49, techId: 86 },
    { id: 58, name: "Doppleganger", slot: 49, techId: 87 },
    { id: 59, name: "Merchant", slot: 50, techId: 0 },
    { id: 60, name: "Officer Corp", slot: 51, techId: 0 },
    { id: 61, name: "Clergy", slot: 52, techId: 0 },
    { id: 62, name: "Engineer", slot: 53, techId: 0 },
    { id: 63, name: "Special Forces", slot: 54, techId: 88 },
    { id: 64, name: "Cybercorp", slot: 54, techId: 89 },
    { id: 65, name: "Rebel Partisans", slot: 55, techId: 0 },
    { id: 66, name: "PTS Laser Canon", slot: 56, techId: 90 },
    { id: 67, name: "PTS Meson Canon", slot: 56, techId: 91 },
    { id: 68, name: "PTS Missile Launcher", slot: 57, techId: 35 },
    { id: 69, name: "Scout Tank", slot: 58, techId: 0 },
    { id: 70, name: "Med Tank", slot: 59, techId: 0 },
    { id: 71, name: "Assault Tank", slot: 59, techId: 92 },
    { id: 72, name: "Anti-infantry Tank", slot: 60, techId: 93 },
    { id: 73, name: "Mega Tank", slot: 61, techId: 94 },
    { id: 74, name: "Hover Tank", slot: 62, techId: 95 },
    { id: 75, name: "Hover Tank Killer", slot: 63, techId: 96 },
    { id: 76, name: "Hover Anti Air", slot: 64, techId: 97 },
    { id: 77, name: "Tank Killer", slot: 65, techId: 0 },
    { id: 78, name: "Hvy Tank Killer", slot: 66, techId: 98 },
    { id: 79, name: "SP Anti Air", slot: 67, techId: 0 },
    { id: 80, name: "SP Artillery", slot: 68, techId: 0 },
    { id: 81, name: "Assault Gun", slot: 69, techId: 99 },
    { id: 82, name: "Rocket Art", slot: 70, techId: 41 },
    { id: 83, name: "Pestulator Artillery", slot: 71, techId: 100 },
    { id: 84, name: "Stealth Tank", slot: 72, techId: 101 },
    { id: 85, name: "Gunship", slot: 73, techId: 26 },
    { id: 86, name: "Atmos Fighter", slot: 74, techId: 0 },
    { id: 87, name: "Morph Fighter", slot: 74, techId: 46 },
    { id: 88, name: "Divebomber", slot: 75, techId: 0 },
    { id: 89, name: "Morph Divebomber", slot: 75, techId: 46 },
    { id: 90, name: "Strategic Bmber", slot: 76, techId: 0 },
    { id: 91, name: "Marauder Lgn", slot: 78, techId: 104 },
    { id: 92, name: "Ranger Lgn", slot: 77, techId: 105 },
    { id: 93, name: "Xyll Warbeast", slot: 79, techId: 103 },
    { id: 94, name: "Shock Lgn", slot: 80, techId: 107 },
    { id: 95, name: "Gen Warrior Lgn", slot: 80, techId: 106 },
    { id: 96, name: "Assault Lgn", slot: 81, techId: 107 },
    { id: 97, name: "Armor Lgn", slot: 82, techId: 108 },
    { id: 98, name: "Chem Shock Lgn", slot: 82, techId: 109 },
    { id: 99, name: "Infantry Lgn", slot: 83, techId: 110 },
    { id: 100, name: "Heavy Inf Lgn", slot: 83, techId: 110 },
    { id: 101, name: "Fanatic Lgn", slot: 83, techId: 111 },
    { id: 102, name: "Militia Lgn", slot: 84, techId: 0 },
    { id: 103, name: "Tracker Lgn", slot: 84, techId: 112 },
    { id: 104, name: "Anti-Aircraft", slot: 85, techId: 0 },
    { id: 105, name: "Anti-Tank Gun", slot: 86, techId: 0 },
    { id: 106, name: "Artillery", slot: 87, techId: 0 },
    { id: 107, name: "Plague Bomb", slot: 88, techId: 113 },
    { id: 108, name: "Scientist", slot: 89, techId: 0 },
    { id: 109, name: "Peasant", slot: 90, techId: 0 },
    { id: 110, name: "Cargo", slot: 91, techId: 0 }
];
let dataDefault = [
    { name: "Nothing", stats: [900, 0, 0, 0, 10, 1, 1], extra: "" },
    { name: "Microbiology", stats: [990, 0, 0, 125, 10, 2, 1], extra: "" },
    { name: "Hospitals", stats: [1, 0, 0, 200, 10, 2, 2], extra: "" },
    { name: "Immunology", stats: [2, 0, 0, 125, 10, 2, 3], extra: "" },
    { name: "Plague Bomb Cure", stats: [800, 0, 0, 250, 10, 0, 0], extra: "" },
    { name: "Pharmaceuticals", stats: [1, 0, 0, 250, 10, 2, 4], extra: "" },
    { name: "Psychopharmacology", stats: [5, 0, 0, 250, 7, 2, 5], extra: "" },
    { name: "Combat Drugs", stats: [6, 0, 0, 250, 4, 2, 6], extra: "" },
    { name: "Wetware", stats: [6, 44, 0, 250, 5, 2, 7], extra: "" },
    { name: "Cyberpilot", stats: [12, 24, 56, 250, 9, 2, 8], extra: "" },
    { name: "Genetics", stats: [1, 0, 0, 250, 9, 2, 9], extra: "" },
    { name: "Genetic Manipulation", stats: [10, 5, 0, 250, 9, 2, 10], extra: "" },
    { name: "Viral DNA", stats: [11, 0, 0, 250, 4, 2, 11], extra: "" },
    { name: "Dormant Virus", stats: [12, 0, 0, 250, 4, 2, 12], extra: "" },
    { name: "Advanced Bacteriology", stats: [11, 0, 0, 250, 8, 2, 13], extra: "" },
    { name: "Guardian Bacteria", stats: [14, 0, 0, 250, 10, 2, 14], extra: "" },
    { name: "Spore Delivery", stats: [14, 0, 0, 250, 4, 2, 15], extra: "" },
    { name: "Necrosis", stats: [16, 0, 0, 400, 4, 2, 16], extra: "" },
    { name: "Cure for Necrosis", stats: [15, 113, 3, 500, 10, 2, 17], extra: "Significantly reduces the chance of the plague spreading to your units." },
    { name: "Xenobiology", stats: [1, 0, 0, 250, 9, 2, 18], extra: "" },
    { name: "Barren Environment", stats: [19, 0, 0, 125, 10, 2, 19], extra: "+3 Agility on Desert Worlds" },
    { name: "Frozen Environment", stats: [19, 0, 0, 125, 10, 2, 20], extra: "+3 Agility on Arctic Worlds" },
    { name: "Jungle Environment", stats: [19, 0, 0, 125, 10, 2, 21], extra: "+3 Agility on Jungle Worlds" },
    { name: "Xaos", stats: [800, 0, 0, 250, 10, 0, 0], extra: "" },
    { name: "Neurocellular Surgery", stats: [8, 0, 0, 350, 6, 2, 22], extra: "" },
    { name: "Physics", stats: [991, 0, 0, 125, 10, 3, 1], extra: "" },
    { name: "Energy Physics", stats: [25, 0, 0, 200, 10, 3, 3], extra: "" },
    { name: "Electron Microscopes", stats: [26, 0, 0, 125, 10, 3, 4], extra: "" },
    { name: "Monopols", stats: [31, 0, 0, 125, 10, 3, 5], extra: "" },
    { name: "Power Cells", stats: [800, 0, 0, 125, 10, 0, 0], extra: "" },
    { name: "Hovertech", stats: [28, 37, 0, 250, 10, 3, 6], extra: "" },
    { name: "Cyclotron", stats: [27, 0, 0, 125, 10, 3, 7], extra: "" },
    { name: "Singularity Tech", stats: [28, 0, 0, 200, 10, 3, 8], extra: "" },
    { name: "Jump Drives", stats: [32, 0, 0, 250, 10, 3, 9], extra: "" },
    { name: "Materials", stats: [800, 0, 0, 125, 10, 0, 0], extra: "" },
    { name: "Megachassis", stats: [25, 0, 0, 125, 10, 3, 2], extra: "" },
    { name: "Composite Armor", stats: [25, 0, 0, 125, 10, 3, 10], extra: "" },
    { name: "Ceramsteel", stats: [27, 36, 0, 200, 10, 3, 11], extra: "" },
    { name: "Ceramsteel Armor", stats: [800, 0, 0, 200, 10, 0, 0], extra: "" },
    { name: "Nanotechnology", stats: [27, 0, 0, 250, 5, 3, 12], extra: "" },
    { name: "Monofilament", stats: [39, 0, 0, 250, 9, 3, 13], extra: "" },
    { name: "Web Missiles", stats: [40, 0, 0, 250, 9, 3, 14], extra: "" },
    { name: "Wireblades", stats: [40, 0, 0, 250, 9, 3, 15], extra: "" },
    { name: "Cyber Robotics", stats: [57, 26, 0, 250, 4, 3, 16], extra: "" },
    { name: "Advanced Nanotech", stats: [40, 43, 0, 250, 6, 3, 17], extra: "" },
    { name: "Neumonic Armor", stats: [44, 0, 0, 250, 6, 3, 18], extra: "" },
    { name: "Polymorphonic Carbon", stats: [44, 0, 0, 250, 6, 3, 19], extra: "" },
    { name: "Discontinuity Field Generator", stats: [33, 0, 0, 250, 10, 3, 20], extra: "" },
    { name: "Monopol Canisters", stats: [800, 0, 0, 125, 10, 0, 0], extra: "" },
    { name: "Cold Fusion Cells", stats: [28, 0, 0, 250, 10, 3, 21], extra: "" },
    { name: "Fusion Beams", stats: [49, 0, 0, 125, 10, 3, 22], extra: "" },
    { name: "Fusion Cannons", stats: [800, 0, 0, 125, 10, 0, 0], extra: "" },
    { name: "Fusion Rifles", stats: [50, 0, 0, 250, 10, 3, 23], extra: "" },
    { name: "Meson Cannon", stats: [52, 0, 0, 350, 9, 3, 24], extra: "" },
    { name: "Powered Csteel Armor", stats: [49, 37, 0, 250, 10, 3, 25], extra: "" },
    { name: "Psychosocial Engineering", stats: [992, 0, 0, 125, 10, 4, 1], extra: "" },
    { name: "Meditation", stats: [55, 0, 0, 125, 10, 4, 13], extra: "" },
    { name: "Fractal Metaphysics", stats: [56, 0, 0, 125, 10, 4, 2], extra: "" },
    { name: "Prana-Bindu", stats: [56, 0, 0, 125, 9, 4, 3], extra: "" },
    { name: "Psychosonic Manipulation", stats: [58, 0, 0, 250, 9, 4, 4], extra: "" },
    { name: "Alien Psychology", stats: [55, 0, 0, 250, 6, 4, 5], extra: "" },
    { name: "Vau Psychology", stats: [60, 0, 0, 250, 4, 4, 6], extra: "+3 Agility when fighting the Vau." },
    { name: "Symbiot Psychology", stats: [60, 0, 0, 250, 1, 4, 7], extra: "+3 Agility when fighting the Symbiots." },
    { name: "Parapsychology", stats: [56, 0, 0, 250, 10, 4, 8], extra: "" },
    { name: "Theurgy", stats: [63, 0, 0, 250, 10, 4, 9], extra: "Required to benefit from Relic bonuses." },
    { name: "Indoctrination", stats: [64, 0, 0, 250, 9, 4, 10], extra: "" },
    { name: "Liturgical Ritual", stats: [65, 0, 0, 250, 9, 4, 11], extra: "" },
    { name: "Holy Warriors", stats: [66, 0, 0, 250, 8, 4, 12], extra: "" },
    { name: "Applied Technology", stats: [993, 0, 0, 0, 10, 1, 1], extra: "" },
    { name: "Space Dreadnought", stats: [70, 53, 0, 500, 9, 5, 5], extra: "Good for bombing planets." },
    { name: "Space Cruiser", stats: [37, 50, 33, 300, 10, 5, 4], extra: "" },
    { name: "Space Destroyer", stats: [72, 50, 0, 250, 10, 5, 3], extra: "" },
    { name: "Space Frigate", stats: [36, 33, 0, 200, 10, 5, 2], extra: "" },
    { name: "Space Carrier", stats: [37, 33, 75, 250, 10, 5, 6], extra: "Space Fighters and Torpedo Bombers may deploy for combat if carried by a carrier." },
    { name: "Battle Carrier", stats: [73, 50, 0, 300, 10, 5, 7], extra: "" },
    { name: "Seraphim Space Fighter", stats: [36, 26, 0, 250, 10, 5, 8], extra: "" },
    { name: "Archangel Space Fighter", stats: [75, 9, 0, 300, 10, 5, 9], extra: "" },
    { name: "Prophet Space Torpedo Bomber", stats: [36, 26, 0, 250, 10, 5, 10], extra: "" },
    { name: "Martyr Torpedo Bomber", stats: [77, 67, 0, 300, 9, 5, 11], extra: "" },
    { name: "Assault Lander Ship", stats: [33, 37, 0, 250, 10, 5, 12], extra: "Can land on any land hex on planet without taking damage." },
    { name: "Freighter", stats: [36, 33, 0, 125, 10, 5, 13], extra: "" },
    { name: "Bulk Hauler", stats: [37, 80, 0, 200, 10, 5, 14], extra: "" },
    { name: "Starbase", stats: [36, 26, 0, 200, 10, 5, 15], extra: "" },
    { name: "Starbase Mk M", stats: [82, 53, 0, 300, 10, 5, 16], extra: "" },
    { name: "Blademaster", stats: [42, 56, 0, 300, 10, 5, 17], extra: "" },
    { name: "Dervishes", stats: [67, 0, 0, 400, 9, 5, 18], extra: "" },
    { name: "Assassin", stats: [58, 59, 0, 250, 4, 5, 19], extra: "" },
    { name: "Doppleganger Assassin", stats: [13, 59, 0, 250, 4, 5, 20], extra: "" },
    { name: "Special Forces", stats: [36, 55, 0, 250, 10, 5, 21], extra: "" },
    { name: "Cybercorp", stats: [88, 8, 24, 300, 5, 5, 22], extra: "" },
    { name: "PTS Fusion Cannon", stats: [35, 50, 0, 250, 10, 5, 23], extra: "" },
    { name: "PTS Meson Cannon", stats: [35, 53, 0, 250, 9, 5, 24], extra: "" },
    { name: "Pitbull Battle Tank", stats: [37, 0, 0, 250, 10, 5, 26], extra: "" },
    { name: "Grim Reaper Field Tank", stats: [36, 52, 0, 300, 5, 5, 27], extra: "" },
    { name: "Mastif Shock Tank", stats: [37, 50, 0, 300, 10, 5, 28], extra: "" },
    { name: "Kestral Hover Tank", stats: [30, 52, 0, 300, 10, 5, 29], extra: "" },
    { name: "Eagle Hover ATG", stats: [30, 50, 0, 300, 10, 5, 30], extra: "" },
    { name: "Peregrine Hover AKAK", stats: [30, 52, 0, 300, 10, 5, 31], extra: "" },
    { name: "Direwolf Heavy ATG", stats: [37, 50, 0, 300, 10, 5, 32], extra: "" },
    { name: "Violator Assault Gun", stats: [37, 52, 0, 300, 10, 5, 33], extra: "" },
    { name: "Pestulator Bio Artillery", stats: [16, 0, 0, 300, 9, 5, 34], extra: "" },
    { name: "Wraith Cloaking Tank", stats: [45, 0, 0, 300, 9, 5, 35], extra: "" },
    { name: "Raider Stealth Ship", stats: [47, 0, 0, 400, 8, 5, 1], extra: "Good for raiding behind the lines." },
    { name: "Xyll Warbeast", stats: [12, 62, 19, 250, 1, 5, 36], extra: "" },
    { name: "Marauder Legion", stats: [108, 0, 0, 250, 10, 5, 38], extra: "" },
    { name: "Ranger Legion", stats: [109, 45, 0, 250, 10, 5, 37], extra: "Because fusion cell radiation kills the cloaking organisms on the surface of the armor, only Grimsons can wear cloaking armor." },
    { name: "Gen Warrior Legion", stats: [37, 12, 0, 250, 6, 5, 39], extra: "" },
    { name: "Assault Legion", stats: [54, 52, 0, 250, 10, 5, 40], extra: "" },
    { name: "Powered Armor Legion", stats: [54, 0, 0, 250, 10, 5, 41], extra: "" },
    { name: "Grimsons Legion", stats: [7, 37, 0, 250, 4, 5, 42], extra: "Aided by combat drugs, Grimsons can wear nonpowered battle armor." },
    { name: "Infantry Legion", stats: [36, 0, 0, 125, 10, 5, 43], extra: "" },
    { name: "Fanatic Legion", stats: [67, 0, 0, 250, 9, 5, 44], extra: "" },
    { name: "Tracker Legion", stats: [58, 0, 0, 125, 10, 5, 45], extra: "" },
    { name: "Plague Bomb", stats: [17, 0, 0, 300, 1, 5, 46], extra: "" },
];
let technology = [];
let techDict = new Map();
let treeList = [];
let treeListLeadsTo = [];
let Colors = new Map();
//let Categories = ["Microbiology", "Physics", "Psychosocial Engineering", "Applied Technology"];
let Categories = [];
let CategoriesUsed = 0;
function initTechnology(data) {
    if (data.length === 0)
        throw new Error("data length is 0");
    technology = [];
    data.forEach((r, i) => {
        technology.push({ id: i, name: r.name, stats: r.stats, extra: r.extra, cost: cost(r) });
    });
    techDict = new Map();
    technology.forEach(tech => {
        techDict.set(tech.name, tech);
    });
    technology.forEach(d => d.requires = getDependencies(d));
    // Find the categories in the TECH.DAT (rows which have stats[0] >= 990)
    // Then assign the techs a category based on if they come after that category's position in the file
    // Assign colors to categories
    Categories = [];
    CategoriesUsed = 0;
    for (let i = 0; i < 100; ++i)
        Categories.push("");
    for (let i = 0; i < technology.length; ++i) {
        let t = technology[i];
        if (t.stats[0] >= 990) {
            Categories[t.stats[0] - 990] = t.name;
            CategoriesUsed++;
        }
    }
    technology.forEach((tech, index) => {
        for (let i = 0; i < Categories.length; ++i) {
            if (Categories[i] === "")
                break;
            if (index >= technology.indexOf(techDict.get(Categories[i])))
                tech.category = Categories[i];
        }
    });
    Colors = new Map();
    for (let i = colorsDefault.length; i < CategoriesUsed; ++i) {
        let key = i.toString();
        if (i < CategoriesUsed)
            key = Categories[i];
        console.log(key);
        Colors.set(key, `hsl(${Math.random() * 360}, 60%, 40%)`);
    }
    for (let i = 0; i < CategoriesUsed; ++i) {
        Colors.set(Categories[i], colorsDefault[i]);
    }
    findRequiredBy();
    treeList = [];
    technology.forEach((t) => treeList.push(generateTreeRequirements(techDict.get(t.name))));
    treeListLeadsTo = [];
    technology.forEach((t) => treeListLeadsTo.push(generateTreeLeadsTo(techDict.get(t.name))));
    if (enableSprites) {
        unitsBase64.sort((a, b) => parseInt(a.name) - parseInt(b.name));
        for (let i = 0; i < 91; ++i) {
            let cur = new Image();
            if (useURI) {
                cur.src = unitsBase64[i].sprite;
            }
            else {
                cur.src = assetPathUnits + i + ".png";
            }
            unitSprites.push(cur);
        }
    }
    dataStructures.forEach(s => {
        let cur = new Image();
        let name = (s.filename) ? s.filename : s.name;
        if (useURI) {
            let idx = 0;
            for (let i = 0; i < structuresBase64.length; ++i) {
                if (structuresBase64[i].name === name) {
                    idx = i;
                    break;
                }
            }
            cur.src = structuresBase64[idx].sprite;
        }
        else {
            cur.src = assetPathStructures + name + ".png";
        }
        structureSprites.set(s.name, cur);
    });
}
var useURI = true;
initTechnology(dataDefault);
let units = [];
let unitDict = new Map();
function initUnits(data) {
    if (data.length === 0)
        throw new Error("data length is 0");
    units = [];
    data.forEach((r, i) => {
        units.push({ slot: r.slot, name: r.name, suffix: r.suffix, abbrev: r.abbrev, stats: r.stats });
    });
    unitDict = new Map();
    units.forEach(unit => {
        unitDict.set(unit.name, unit);
    });
}
function cost(tech) { return tech.stats[3]; }
;
// function getTech(index?: number, name?: string): Tech | null {
//     if (index) return technology[index];
//     if (name) return techDict.get(name);
//     return null;
// }
function getDependencies(tech) {
    let deps = [];
    for (let i = 0; i < 3; ++i) {
        let idx = tech.stats[i];
        if (idx !== 0 && idx < 200)
            deps.push(technology[idx]);
    }
    return deps;
}
let highlightEnabled = true;
let showChurchLike = false;
let canvas = document.querySelector(".canvas");
let width = canvas.width = canvas.clientWidth;
let height = canvas.height = canvas.clientHeight;
let ctx = canvas.getContext("2d");
let mouseX = 0;
let mouseY = 0;
function findRequiredBy() {
    technology.forEach(tech => {
        tech.leadsTo = technology.filter(d => getDependencies(d).includes(tech));
    });
}
// Bi-directional graph?
function generateTreeRequirements(root) {
    technology.forEach(t => t.parent = undefined);
    if ((root.stats[0] === 800) || root.requires.length === 0) {
        let tree = [[]];
        tree[0].push(new Cell(tree, root, { x: 0, y: 0 }, { x: 0, y: 0 }, false));
        return tree;
    }
    // generate a master array of all techs that the root tech depends on
    let arr = [];
    if (root.requires)
        arr = arr.concat(root.requires);
    else {
        let tree = [[]];
        tree[0].push(new Cell(tree, root, { x: 0, y: 0 }, { x: 0, y: 0 }, false));
        return tree;
    }
    arr.forEach(e => { e.parent = root; });
    for (let i = 0; i < arr.length; ++i) {
        arr[i].requires?.forEach(req => { req.parent = arr[i]; });
        if (arr[i].requires)
            arr = arr.concat(arr[i].requires);
    }
    // Traverse through every node to the root, in order to generate an exhaustive array of paths to root
    let pathList = [];
    for (let i = arr.length - 1; i >= 0; --i) {
        let path = [];
        let tech = arr[i];
        path.push(tech);
        while (tech.parent !== undefined) {
            tech = tech.parent;
            path.push(tech);
        }
        // Only insert unique paths that have been found
        let insert = true;
        pathList.forEach(e => { if (arrayEquals(e, path))
            insert = false; });
        if (insert)
            pathList.push(path);
    }
    // Sort the paths so that the longest is on top
    pathList.sort((a, b) => b.length - a.length);
    // Start from the smallest path, and remove that path if it has any node which are already in the longest (top path)
    let uniqueOnly = true;
    if (uniqueOnly) {
        for (let j = 0; j < pathList.length; ++j) {
            let longest = pathList[j];
            let removeList = [];
            for (let i = pathList.length - 1; i > j; --i) {
                let current = pathList[i];
                let remove = false;
                for (let n = 0; n < current.length; ++n) {
                    // flag the curerrent path for removal
                    if (longest.includes(current[n]))
                        remove = true;
                    break;
                }
                if (remove)
                    removeList.push(i);
            }
            // remove all the flagged paths from the list
            pathList = pathList.filter((e, i) => !removeList.includes(i));
        }
    }
    pathList.forEach(p => p = p.reverse());
    let tree = [];
    for (let y = pathList.length - 1; y >= 0; --y) {
        tree.push([]);
        for (let x = 0; x < pathList[y].length; ++x) {
            tree[pathList.length - y - 1].push(new Cell(tree, pathList[y][x], { x: 0, y: 0 }, { x: 0, y: 0 }, false));
        }
    }
    tree.sort((a, b) => b.length - a.length);
    // Apply indices to Cells
    for (let y = 0; y < tree.length; ++y) {
        for (let x = 0; x < tree[y].length; ++x) {
            let cur = tree[y][x];
            cur.indices = { x: x, y: y };
        }
    }
    // Hide repeated techs from view
    if (tree.length > 0) {
        for (let j = pathList.length - 1; j > 0; --j) {
            for (let i = 0; i < pathList[j].length; ++i) {
                let cur = tree[j][i];
                let above = tree[j - 1][i];
                if (above != null && cur != null) {
                    if (above.tech.name === cur.tech.name) {
                        cur.isHidden = true;
                    }
                }
            }
        }
    }
    for (let y = 0; y < tree.length; ++y) {
        for (let x = 0; x < pathList[y].length; ++x) {
            tree[y][x]?.findTargetIndices();
        }
    }
    if (tree.length === 0 || tree[0].length === 0)
        debugger;
    return tree;
}
function pathString(path) {
    let str = "";
    let sep = " <- ";
    path.reverse();
    path.forEach(n => str = (str.concat(n.name)) + sep);
    str = str.substring(0, str.length - sep.length);
    return str;
}
function getPathCost(path) {
    return path.map(t => !t.isHidden ? t.tech?.cost : 0).reduce((a, b) => addNumberOrUndefined(a, b));
}
function getTreeCost(tree) {
    return tree.map(t => getPathCost(t)).reduce((a, b) => addNumberOrUndefined(a, b));
}
function addNumberOrUndefined(a, b) {
    return (a ?? 0) + (b ?? 0);
}
function renderTreeRequirements(x, y, tree) {
    let root = tree[0][0];
    let xs = (techBoxSpacingX + techBoxWidth);
    let ys = (techBoxSpacingY + techBoxHeight);
    drawTechBox(x, y, techBoxWidth, techBoxHeight, root.tech);
    for (let row = 0; row < tree.length; ++row) {
        for (let col = 0; col < tree[row].length; ++col) {
            let cell = tree[row][col];
            let cx = x + col * xs;
            let cy = y + row * ys;
            if (!cell.isHidden) {
                drawTechBox(cx, cy, techBoxWidth, techBoxHeight, cell.tech);
                if (cell !== root) {
                    ctx.strokeStyle = connectionColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy + techBoxHeight / 2);
                    let offset = sub(cell.indices, cell.targetIndices);
                    if (offset.x == 1 && offset.y > 0) {
                        let t = cell.targetIndices;
                        let tx = x + t.x * xs;
                        let ty = y + t.y * ys;
                        ctx.moveTo(cx, cy + techBoxHeight / 2);
                        // The formula here needs rethinking. Trees with too many rows will have the lines shoot off the left side
                        let mul = 1.8;
                        ctx.lineTo(cx - techBoxSpacingX / mul * (offset.y + 1), cy + techBoxHeight / 2);
                        ctx.lineTo(cx - techBoxSpacingX / mul * (offset.y + 1), ty + techBoxHeight);
                    }
                    else {
                        ctx.lineTo(cx - techBoxSpacingX, cy + techBoxHeight / 2);
                    }
                    ctx.stroke();
                }
            }
        }
    }
    return { outerWidth: tree[0].length * (techBoxSpacingX + techBoxWidth), outerHeight: tree.length * (techBoxSpacingY + techBoxHeight) };
}
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
;
let htmlTest = false;
function init() {
    if (!htmlTest)
        return;
    let parent = document.getElementById("main_container");
    if (parent) {
        technology.forEach((t, i) => {
            let cur = document.createElement("div");
            cur.className = "tech_box";
            cur.id = "tech_box_" + i;
            cur.innerText = t.name;
            //cur.setAttribute("style", `background-color:${Colors.get(t.category!)}; color: white`);
            cur.setAttribute("style", generateStyle(t));
            parent?.appendChild(cur);
        });
    }
}
function generateStyle(tech) {
    let style = "";
    style += "color: " + textPlainColor + ";";
    style += "background-color: " + Colors.get(tech.category) + ";";
    style += "text-shadow: 2px 2px " + textShadowColor + ";";
    style += "font-size: " + textHeight + "px;";
    style += "font-family: " + '"Georgia"' + ";";
    return style;
}
function clear(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}
function draw() {
    clear("#111");
    hoveredTech = null;
    state();
    if (hoveredTech)
        drawTooltip(hoveredTech);
}
function drawTooltip(tech) {
    ctx.save();
    let x = mouseX + 20;
    let y = mouseY + 12;
    let tooltip = "";
    let structure = dataStructures[tech.id];
    if (tech && tech.extra)
        tooltip += tech.extra;
    if (structure && structure.extra)
        tooltip += ("\n" + structure.extra);
    let desiredWidth = 400;
    let resultWidth = width - 20 - x > desiredWidth ? desiredWidth : width - 20 - x;
    let lineHeight = 24;
    let lines = stringToWrapped(tooltip, resultWidth).split("\n").filter(l => l.length > 0);
    let bWidth = lines.map(ln => ctx.measureText(ln).width).sort((a, b) => b - a)[0];
    ctx.textBaseline = "top";
    if (lines.length > 0) {
        ctx.fillStyle = "rgba(20,20,20, 0.95)";
        roundRect(x - 2, y - 2, bWidth, lineHeight * lines.length, 4);
        ctx.fill();
        lines.forEach((ln, i) => textShadowed(ln, textPlainColor, textShadowColor, x, y + (lineHeight * i)));
    }
}
function split(text) {
    return text.split('\n');
}
function stringToWrapped(text, maxWidth) {
    let initalWidth = ctx.measureText(text);
    if (initalWidth.width < maxWidth)
        return text;
    let words = text.split(" ");
    if (words.length == 1) {
        let len = 0;
        let buf = [];
        let tmpWord = "";
        let letters = words[0];
        for (let i = 0; i < letters.length; ++i) {
            if (len >= maxWidth) {
                tmpWord += "\n";
                buf.push(tmpWord);
                tmpWord = "";
                len = 0;
            }
            tmpWord += letters[i];
            len += ctx.measureText(tmpWord).width;
        }
        return buf.join("");
    }
    let len = 0;
    let buf = [];
    for (let i = 0; i < words.length; ++i) {
        if (len + ctx.measureText(words[i]).width > maxWidth) {
            buf.push("\n");
            len = 0;
        }
        buf.push(words[i]);
        len += ctx.measureText(words[i]).width;
    }
    return buf.join(" ");
}
// Generate a complete tree of every tech that depends on the rootTech
function generateTreeLeadsTo(rootTech) {
    let tree = [[]];
    let root = new Cell(tree, rootTech, { x: 0, y: 0 }, { x: 0, y: 0 }, false);
    let queue = [];
    let processed = [];
    if (root.tech === undefined)
        throw new Error("Non-existent Technology passed into generateTreeLeadsTo()!");
    // Tech doesn't lead to anything, so return it all alone
    if (root.tech.leadsTo === undefined || root.tech.leadsTo.length === 0) {
        tree[0].push(root);
        return tree;
    }
    queue = queue.concat(expandCell(root));
    processed.push(root);
    // Exhaustively traverse all the techs which eventually depend on the current tech
    let cur;
    while ((cur = queue.shift()) !== undefined) {
        queue = queue.concat(expandCell(cur));
        processed.push(cur);
    }
    let tmp = new Map();
    processed = processed.filter((v) => {
        if (!tmp.has(v.tech)) {
            tmp.set(v.tech, true);
            return true;
        }
        else {
            return false;
        }
    });
    // Push enough empty columns into the tree to fit the width
    let cols = processed[processed.length - 1].indices.x;
    for (let i = 0; i < cols; ++i)
        tree.push([]);
    // Insert cells into the columns of the tree based on their x coordinate index
    processed.forEach(p => {
        p.indices.y = tree[p.indices.x].length;
        tree[p.indices.x].push(p);
    });
    // Figure out which grid square the cell's bezier line should point to
    processed.forEach(p => {
        let x = p.indices.x - 1;
        x = x < 0 ? 0 : x;
        for (let y = 0; y < tree[x].length; ++y) {
            let cur = tree[x][y];
            if (cur.tech.leadsTo?.includes(p.tech)) {
                p.targetIndices.y = cur.indices.y;
                break;
            }
        }
    });
    return tree;
}
function expandCell(c) {
    return c.tech.leadsTo?.map(t => new Cell(c.tree, t, { x: c.indices.x + 1, y: 0 }, { x: c.indices.x, y: 0 }, false)) ?? [];
}
function renderTreeLeadsTo(originX, originY, tree) {
    let biggestY = 0;
    for (let x = 0; x < tree.length; ++x) {
        for (let y = 0; y < tree[x].length; ++y) {
            biggestY = biggestY < y ? y : biggestY;
            let cur = tree[x][y];
            let cx = originX + cur.indices.x * (techBoxSpacingX + techBoxWidth);
            let cy = originY + cur.indices.y * (techBoxSpacingY + techBoxHeight);
            drawTechBox(cx, cy, techBoxWidth, techBoxHeight, cur.tech);
            if (!nullVec(cur.indices)) {
                let tx = (originX + (cur.targetIndices.x) * (techBoxSpacingX + techBoxWidth)) + techBoxWidth;
                let ty = (originY + cur.targetIndices.y * (techBoxSpacingY + techBoxHeight)) + techBoxHeight / 2;
                ctx.strokeStyle = connectionColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy + techBoxHeight / 2);
                let cp1 = { x: cx - techBoxSpacingX / 2, y: cy + techBoxHeight / 2 };
                let cp2 = { x: tx + techBoxSpacingX / 2, y: ty };
                ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tx, ty);
                ctx.stroke();
            }
            ctx.fillStyle = textPlainColor;
        }
    }
    return { outerHeight: biggestY * (techBoxSpacingY + techBoxHeight) };
}
let showDuplicates = true;
function drawTechBox(x, y, w, h, tech) {
    ctx.fillStyle = Colors.get(tech.category);
    //ctx.fillRect(x, y, w, h); // sharp cornered rects
    roundRect(x, y, w, h, 4); // rounded rects
    if (ctx.isPointInPath(mouseX, mouseY))
        hoveredTech = tech;
    ctx.fill(); //
    if (tech === hoveredTech && highlightEnabled) {
        if (hoveredTech === activeTech)
            ctx.strokeStyle = topHighlightColor;
        else
            ctx.strokeStyle = depsHighlightColor;
        roundRect(x, y, w, h, 4);
        ctx.stroke();
    }
    drawTechLabel(x, y, tech);
}
function drawTechLabel(x, y, tech) {
    ctx.font = fontString;
    ctx.textBaseline = "top"; // upper left corner
    //y = y + 20;               // centered vertically
    let label = `${tech.name}`; // T${tech.depth}
    ctx.fillStyle = textShadowColor;
    ctx.fillText(label, x + 4, y + 4, techBoxWidth - 4);
    ctx.fillStyle = "#eff";
    if (showChurchLike) {
        let cl = tech.stats[4];
        if (cl < 10)
            ctx.fillStyle = churchDisdainColor;
        if (cl < 5)
            ctx.fillStyle = churchHateColor;
        if (cl < 3)
            ctx.fillStyle = churchRepugnantColor;
    }
    ctx.fillText(label, x + 2, y + 2, techBoxWidth - 4);
    // Research Point cost labels
    let lx = x + techBoxWidth - 4;
    let ly = y + techBoxHeight - 10;
    // ctx.fillStyle = Colors.get(tech.category!)!;
    // //ctx.fillRect(lx, ly, 40, 20);
    // roundRect(lx, ly, 40, 20, 4); // rounded rects
    // ctx.fill();    
    let ty = -7;
    let rp = `  ${cost(tech)}`;
    let prv = ctx.textAlign;
    ctx.textAlign = "right";
    ctx.fillStyle = textShadowColor;
    ctx.fillText(rp, lx + 2, ly + ty + 2, techBoxWidth);
    ctx.fillStyle = textPlainColor;
    ctx.fillText(rp, lx, ly + ty, techBoxWidth);
    ctx.textAlign = prv;
}
function drawGrid() {
    //let w = techBoxWidth;
    //let h = techBoxHeight * 1.5;
    let w = 200;
    let h = 60;
    if (!enableSprites)
        h = 40;
    let space = 5;
    let cols = 6;
    if (width < 6 * w) {
        cols = Math.floor(width / (w));
    }
    technology.forEach((tech, index) => {
        ctx.fillStyle = Colors.get(tech.category);
        let x = Math.floor(index % cols) * w * 1.025;
        let y = Math.floor(index / cols) * h * 1.1;
        ctx.fillRect(x, y, w, h);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        if (ctx.isPointInPath(mouseX, mouseY))
            hoveredTech = tech;
        ctx.fill();
        if (tech == hoveredTech && highlightEnabled) {
            ctx.strokeStyle = highlightColor;
            ctx.strokeRect(x, y, w, h);
        }
        ctx.font = fontString;
        ctx.textBaseline = "top";
        ctx.fillStyle = textShadowColor;
        ctx.fillText(tech.name, x + 4, y + 4, w - 4);
        if (enableSprites) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            let structure = dataStructures[tech.id];
            if (structure != null && tech.id !== 0) {
                let sprite = structureSprites.get(structure.name);
                if (sprite) {
                    ctx.drawImage(sprite, x, y + 16);
                }
            }
            ctx.restore();
        }
        // Fix this awful looping code
        if (units) {
            ctx.imageSmoothingEnabled = false;
            let count = 0;
            unitInfoArray.forEach(u => {
                if (u.techId === tech.id && tech.id !== 0) {
                    if (unitSprites[u.slot]) {
                        ctx.drawImage(unitSprites[u.slot], x + w - ((count + 1) * 36), y + 24);
                        count++;
                    }
                }
            });
        }
        ctx.fillStyle = "#eff";
        if (showChurchLike) {
            let cl = tech.stats[4];
            if (cl < 10)
                ctx.fillStyle = churchDisdainColor;
            if (cl < 5)
                ctx.fillStyle = churchHateColor;
            if (cl < 3)
                ctx.fillStyle = churchRepugnantColor;
        }
        ctx.fillText(tech.name, x + 2, y + 2, w - 4);
        ctx.fillStyle = "#eff";
        let lx = x + w - 4;
        let ly = y + h - 10;
        if (hoveredTech === tech || showAllTotalCostsInGridMode) {
            let ty = -8;
            let rp = `  ${getTreeCost(generateTreeRequirements(tech))}`;
            let prv = ctx.textAlign;
            ctx.textAlign = "right";
            ctx.fillStyle = textShadowColor;
            ctx.fillText(rp, lx + 2, ly + ty + 2, w);
            ctx.fillStyle = textPlainColor;
            ctx.fillText(rp, lx, ly + ty, w);
            ctx.textAlign = prv;
        }
    });
}
function update() {
}
function animate() {
    requestAnimationFrame(animate);
    update();
    draw();
}
function roundRect(x, y, w, h, r) {
    if (w < 2 * r)
        r = w / 2;
    if (h < 2 * r)
        r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function mag(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}
function add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}
function sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}
function scale(v, s) {
    return { x: v.x *= s, y: v.y *= s };
}
function nullVec(v) {
    return v.x === 0 && v.y === 0;
}
function equalVec(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
}
function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
}
function controlText(control, text, x, y) {
    ctx.fillStyle = textControlColor;
    ctx.fillText(control, x, y);
    ctx.fillStyle = textPlainColor;
    ctx.fillText(" " + text, x + ctx.measureText(control).width, y);
}
function textShadowed(text, primary, secondary, x, y) {
    let weight = ctx.lineWidth;
    ctx.fillStyle = secondary;
    ctx.fillText(text, x + weight, y + weight);
    ctx.fillStyle = primary;
    ctx.fillText(text, x, y);
}
let textHeight = 18;
let columnTwoOffset = 500;
let controlsX = 5;
let contorlsY = height - textHeight * 3;
function showCommonControls() {
    ctx.textBaseline = "bottom";
    ctx.fillStyle = helpBoxColor;
    ctx.fillRect(0, height - textHeight * 4, 1000, textHeight * 4);
    controlText("Left-Click", "on a technology to show its requirements.", controlsX, contorlsY + textHeight * 0);
    controlText("Right-Click", "on a technology to show techs that depend on it.", controlsX, contorlsY + textHeight * 1);
    controlText("t", "to toggle showing total costs on all techs.", controlsX, contorlsY + textHeight * 2);
    controlText("h", "to toggle Church opinion.", controlsX, contorlsY + textHeight * 3);
    controlText("Drag-and-drop", "a UNIT.DAT onto the window to enable unit sprites.", controlsX + columnTwoOffset, height - textHeight * 3);
    controlText("Drag-and-drop", "a TECH.DAT onto the window to load it.", controlsX + columnTwoOffset, height - textHeight * 1);
}
function showGridModeControls() {
    showCommonControls();
    controlText("Mouse-wheel", "to scroll the view up and down.", controlsX + columnTwoOffset, height);
}
function showTreeModeControls() {
    showCommonControls();
    controlText("Right-Click", "in open space to return to the menu.", controlsX + columnTwoOffset, height - textHeight * 2);
    controlText("Mouse-wheel", "to scroll the view left and right.", controlsX + columnTwoOffset, height);
}
function showTreeTopModeControls() {
    showCommonControls();
    controlText("Right-Click", "in open space to return to the menu.", controlsX + columnTwoOffset, height - textHeight * 2);
    controlText("Mouse-wheel", "to scroll the view left and right.", controlsX + columnTwoOffset, height);
}
function gridMode() {
    ctx.translate(0, -scrollOffsetCurrentY);
    drawGrid();
    ctx.resetTransform();
    showGridModeControls();
}
function treeMode() {
    ctx.translate(-scrollOffsetCurrentX, 0);
    renderTreeRequirements(5, 10, treeList[activeTech.id]);
    ctx.resetTransform();
    ctx.textBaseline = "bottom";
    showTreeModeControls();
}
let tempScale = 1;
function treeTopMode() {
    ctx.translate(-scrollOffsetCurrentX, 0);
    ctx.scale(tempScale, tempScale);
    let outerHeight = renderTreeLeadsTo(5, 10, treeListLeadsTo[activeTech.id]).outerHeight * 1.4;
    tempScale = outerHeight >= height ? 1 / (outerHeight / height) : 1;
    ctx.resetTransform();
    showTreeTopModeControls();
}
let state = gridMode;
let hoveredTech = null;
let activeTech = technology[0];
let showAllTotalCostsInGridMode = false;
function calculateCanvasResolution() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}
window.onresize = calculateCanvasResolution;
canvas.addEventListener("mousemove", function (e) {
    const cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
    const canvasX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas 
    const canvasY = Math.round(e.clientY - cRect.top); // from the X/Y positions to make  
    ctx.clearRect(0, 0, canvas.width, canvas.height); // (0,0) the top left of the canvas
    ctx.fillText("X: " + canvasX + ", Y: " + canvasY, 10, 20);
    mouseX = canvasX;
    mouseY = canvasY;
});
let scrollOffsetCurrentY = 0;
let scrollOffsetTargetY = 0;
let scrollOffsetCurrentX = 0;
let scrollOffsetTargetX = 0;
canvas.addEventListener("wheel", e => {
    if (state === gridMode) {
        let scrollDelta = e.deltaY > 0 ? 1 : -1;
        scrollOffsetTargetY += scrollDelta * 120;
        scrollOffsetTargetY = scrollOffsetTargetY > 0 ? scrollOffsetTargetY : 0;
        scrollOffsetCurrentY = scrollOffsetTargetY;
    }
    if (state !== gridMode) {
        let scrollDelta = e.deltaY > 0 ? 1 : -1;
        scrollOffsetTargetX += scrollDelta * 120;
        scrollOffsetTargetX = scrollOffsetTargetX > 0 ? scrollOffsetTargetX : 0;
        scrollOffsetCurrentX = scrollOffsetTargetX;
    }
}, { passive: true });
canvas.addEventListener("click", e => {
    if (hoveredTech != null) {
        activeTech = hoveredTech;
        state = treeMode;
    }
});
canvas.addEventListener("contextmenu", e => {
    if (state !== gridMode && hoveredTech === null) {
        state = gridMode;
        activeTech = technology[0];
    }
    else {
        if (hoveredTech) {
            activeTech = hoveredTech;
            state = treeTopMode;
        }
    }
    e.preventDefault();
});
document.addEventListener("keyup", e => {
    if (e.key == "t")
        showAllTotalCostsInGridMode = !showAllTotalCostsInGridMode;
    if (e.key == "h")
        showChurchLike = !showChurchLike;
    if (e.key == "Home") {
        scrollOffsetCurrentY = 0;
        scrollOffsetTargetY = 0;
        scrollOffsetCurrentX = 0;
        scrollOffsetTargetX = 0;
    }
});
function dragOverHandler(e) {
    e.preventDefault();
}
function dropHandler(e) {
    console.log('File(s) dropped');
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();
    let files = [];
    if (e.dataTransfer?.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (e.dataTransfer.items[i].kind === 'file') {
                let file = e.dataTransfer.items[i].getAsFile();
                if (file)
                    files.push(file);
            }
        }
    }
    else {
        // Use DataTransfer interface to access the file(s)
        if (e.dataTransfer) {
            for (var i = 0; i < e.dataTransfer.files.length; i++) {
                files.push(e.dataTransfer.files[i]);
            }
        }
    }
    files.forEach(f => console.log(f.name));
    files.forEach(f => {
        if (f.name.toUpperCase().includes(".DAT")) {
            if (f.name.toUpperCase() === "TECH.DAT") {
                f.text().then(t => initTechnology(parseDatTech(t)));
            }
            if (f.name.toUpperCase() === "UNIT.DAT") {
                f.text().then(t => initUnits(parseDatUnit(t)));
            }
        }
    });
}
function parseDatTech(dat) {
    let dataLoaded = [];
    let lines = dat.split('\n');
    lines.forEach(l => {
        if (!l.includes("//") && l.charAt(0) !== '{' && l.charAt(0) !== '}' && l.charAt(0) === "\"")
            dataLoaded.push(parseTechRow(l));
    });
    if (dataLoaded.length === 0)
        throw new Error("Failed to parse TECH.DAT");
    return dataLoaded;
}
function parseTechRow(row) {
    let tok = row.split("\"");
    tok = tok.filter(t => t.length !== 0 && t.trim().length !== 0);
    let stats = tok[3].split(" ")?.filter(n => n.length !== 0).map(Number);
    let tech = { name: tok[1], stats: stats, extra: tok[5] ?? "" };
    return tech;
}
function parseDatUnit(dat) {
    let dataLoaded = [];
    let lines = dat.split('\n');
    let slot = 0;
    lines.forEach(l => {
        if (l.charAt(0) === '{') {
            let tok = l.split(" ");
            slot = parseInt(tok[0].trim().substring(1));
        }
        if (!l.includes("//") && l.charAt(0) !== '{' && l.charAt(0) !== '}' && l.charAt(0) === "\"")
            dataLoaded.push(parseUnitRow(l, slot));
    });
    if (dataLoaded.length === 0)
        throw new Error("Failed to parse UNIT.DAT");
    return dataLoaded;
}
function parseUnitRow(row, slot) {
    let tok = row.split("\"");
    tok = tok.filter(t => t.length !== 0 && t.trim().length !== 0);
    let stats = tok[6].split(" ")?.filter(n => n.length !== 0 && !isAlpha(n)).map(Number);
    let unit = { slot: slot, name: tok[1], suffix: parseInt(tok[2]), abbrev: tok[4], stats: stats };
    return unit;
}
function exportUnits() {
}
var isAlpha = function (ch) {
    return /^[A-Z]$/i.test(ch);
};
init();
animate();
//# sourceMappingURL=main.js.map