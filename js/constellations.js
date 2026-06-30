const constellation_lines = [
    //big dipper
    [5191, 5054], //alkaid to mizar
    [5054, 4905], //mizar to alioth
    [4905, 4660], //alioth to megrez
    [4660, 4301], //megrez to dubhe
    [4301, 4295], //dubhe to merak
    [4295, 4554], //merak to phecda
    [4554, 4660], //phecda to megrez

    //Capricorn
    [7747, 7776], // α Cap (Algedi) -> β Cap (Dabih)
    [7776, 7936], // β Cap -> ψ Cap
    [7936, 8260], // ψ Cap -> ω Cap
    [8260, 8322], // ω Cap -> ζ Cap
    [8322, 8278], // ζ Cap -> θ Cap
    [8278, 8167], // θ Cap -> δ Cap (Deneb Algedi)
    [8167, 7776], // δ Cap -> β Cap
    [8167, 8213], // δ Cap -> γ Cap (Nashira)
    [8213, 8322], // γ Cap -> ζ Cap

    //Aries
    [838, 617], // 41 Ari to Hamal
    [617, 553], // Hamal to Sheratan
    [553, 545], // Sheratan to Mesartim

    //Orion
    [2047, 2159], //Chi 1 orionis to nu orionis
    [2130, 2199], //64 orionis to xi orionis
    [2159, 2199], //Nu orionis to xi orionis
    [2159, 2124], //Nu orionis to mu orionis
    [2199, 2124], //Xi orionis to mu orionis
    [2124, 2061], //mu orionis to betelegeuse
    [2061, 1949], //beteleguuse to alnitak
    [1949, 2004], //alnitak to kappa orionis
    [2004, 1713], //kappa orionis to rigel
    [1713, 1852], //rigel to mintaka
    [1852, 1790], //mintaka to bellatrix
    [1790, 1879], //upsilon orionis to lambda orionis
    [1879, 2061], //Bellatrix to betelegeuse
    [1879, 1543], //bellatrix to Tabit
    [1543, 1544], //tabit to pi 2 orionis
    [1544, 1570], //pi 2 orionis to pi 1 orionis
    [1543, 1552], //tabit to pi 4 orionis
    [1552, 1567], //pi 4 orionis to pi 5 orionis
    [1567, 1601], //pi 5 orionis to pi 6 orionis

    //Hydra
    [3547, 3482], // Zeta Hydrae to epsilon Hydrae
    [3482, 3410], // epsilon Hydrae to delta Hydrae
    [3410, 3418], // delta Hydrae to sigma Hydrae
    [3547, 3454], // Zeta Hydrae to eta Hydrae
    [3547, 3613], //Zeta hydrae to omega hydrae
    [3613, 3665], //omega hydrae to theta hydrae
    [3665, 3787], //Theta hydrae to tau 2 hydrae
    [3787, 3748], //tau 2 hydrae to alphard
    [3748, 3903], //alphard to upsilon 1 hydrae
    [3903, 3994], //upsilon 1 hydrae to lambda hydrae
    [3994, 4094], //lambda hydrae to mu hydrae
    [4094, 4232], //mu hydrae to nu hydrae
    [4232, 4450], //nu hydrae to xi hydrae
    [4450, 4552], //xi hydrae to beta hydrae
    [4552, 4958], //beta hydrae to psi hydrae
    [4958, 5020], //psi hydrae to gamma hydrae

    //Bootes
    [5200, 5235], //upsilon bootes to muphrid
    [5235, 5340], //muphrid to arcturus
    [5478, 5340], //Zeta bootes to arcturus
    [5340, 5506], //arcturus to Izar
    [5506, 5681], //Izar to theta bootes
    [5681, 5602], //theta bootes to nekkar
    [5602, 5435], //nekkar to seginus
    [5435, 5429], //seginus to rho bootes
    [5429, 5340], //rho bootes to arcturus
];