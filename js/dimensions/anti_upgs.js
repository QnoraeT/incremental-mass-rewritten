const ANTI_UPGS = {
    main: {
        temp() {
            for (let x = 1; x <= this.cols; x++) {
                for (let y = 1; y <= this[x].lens; y++) {
                    let u = this[x][y]
                    if (u.effDesc) tmp.anti.upgs.main[x][y] = { effect: u.effect(), effDesc: u.effDesc() }
                }
            }
        },
        ids: [null, 'am'],
        cols: 1,
        over(x,y) { player.anti.main_upg_msg = [x,y] },
        reset() { player.anti.main_upg_msg = [0,0] },
        1: {
            title: "Anti-Mass Upgrades",
            res: "of anti-mass",
            mass: true,
            getRes() { return player.anti.mass },
            unl() { return true },
            can(x) { return player.anti.mass.gte(this[x].cost) && !player.anti.mainUpg.am.includes(x) },
            buy(x) {
                if (this.can(x)) {
                    player.anti.mass = player.anti.mass.sub(this[x].cost)
                    player.anti.mainUpg.am.push(x)
                }
            },
            auto_unl() { return false },
            lens: 4,

            1: {
                desc: "Anti-Mass is boosted by Mass.",
                cost: E(10),
                effect() {
                    let x = player.mass.add(1).log10().add(1).log10().add(1).tetrate(1.5)
                    return x
                },
                effDesc(x=this.effect()) {
                    return x.format()+"x"
                },
            },
            2: {
                desc: "All Ranks no longer reset anything.",
                cost: E(1e3),
            },
            3: {
                desc: "Neutron Star gain is multipled by 10",
                cost: E(1e4),
            },
            4: {
                desc: "Anti-mass gain is increased by 10% for every supernovas you become.",
                cost: E(5e4),
                effect() {
                    let x = Decimal.pow(1.1,player.supernova.times.softcap(100,1/3,0))
                    return x
                },
                effDesc(x=this.effect()) {
                    return x.format()+"x"+softcapHTML(x,1.1**100)
                },
            },
        },
    },
}

/*
1: {
    desc: "Placeholder.",
    cost: E(1),
    effect() {
        let x = E(1)
        return x
    },
    effDesc(x=this.effect()) {
        return format(x)+"x"
    },
},
*/

function hasAntiUpgrade(id,x) { return player.anti.mainUpg[id].includes(x) }
function antiUpgEffect(id,x,def=E(1)) { return tmp.anti.upgs.main[id][x]?tmp.anti.upgs.main[id][x].effect:def }