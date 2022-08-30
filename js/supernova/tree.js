const TREE_TAB = [
    {title: "Main"},
    {title: "Quality of life"},
    {title: "Challenge"},
    {title: "Post-Supernova", unl() { return player.supernova.post_10 } },
    {title: "Quantum", unl() { return quUnl() } },
]

const TREE_IDS = [
    [
        ['c'],
        ['qol1','','','','qu_qol1',''],
        ['chal1'],
        ['bs4','bs1','','qf1','','rad1'],
        ['qu0'],
    ],[
        ['s1','m1','rp1','bh1','sn1'],
        ['qol2','qol3','qol4','qu_qol2','qu_qol3','qu_qol4','qu_qol5','qu_qol6'],
        ['chal2','chal4a','chal4b','chal3'],
        ['bs5','bs2','fn1','bs3','qf2','qf3','rad2','rad3'],
        ['prim3a','qu1','qu2','qu3','qc8'],
    ],[
        ['s2','m2','t1','d1','bh2','gr1','sn2'],
        ['qol5','qol6','qol7','','qu_qol7a','qu_qol7','',''],
        ['chal4','chal7a'],
        ['fn4','fn3','fn9','fn2','fn5','qf4','rad4','rad5'],
        ['prim3','prim2','prim1','qu4','qc1','qc2','qc3'],
    ],[
        ['s3','m3','gr2','sn3'],
        ['qol9','unl1','qol8','unl2','unl3','qu_qol8','qu_qol9','unl4'],
        ['chal5','chal6','chal7','chal8'],
        ['fn12','fn11','fn6','fn10','rad6',''],
        ['prim4','en2','en1','qu5','br1','br2','qc4'],
    ],[
        ['s4','sn5','sn4'],
        ['','','','qu_qol10','qu_qol11','qu_qol8a','qu_qol13','qu_qol12'],
        ['chal9','chal10','chal11','chal12'],
        ['fn13','fn14','fn7','fn8','pm1',''],
        ['prim5','qu6','qu7','qu8','qu9','qu10','qu11','qc5'],
    ],[
        ['s5','sn6'],
        [],
        ['chal13','chal14'],
        ['fn18','fn16','fn17','fn15','pm2','im1'],
        ['prim6','prim7','prim8','qu12','br3','qc7','qc6'],
    ],
]

var tree_canvas,tree_ctx,tree_update=true

const NO_REQ_QU = ['qol1','qol2','qol3','qol4','qol5',
'qol6','qol7','qol8','qol9','unl1',
'c','s2','s3','s4','sn3',
'sn4','t1','bh2','gr1','chal1',
'chal2','chal3','bs1','fn2','fn3',
'fn5','fn6']

const TREE_UPGS = {
    buy(x, auto=false) {
        if ((tmp.supernova.tree_choosed == x || auto) && tmp.supernova.tree_afford[x]) {
            if (this.ids[x].qf) player.qu.points = player.qu.points.sub(this.ids[x].cost).max(0)
            else player.supernova.stars = player.supernova.stars.sub(this.ids[x].cost).max(0)
            player.supernova.tree.push(x)
        }
    },
    ids: {
        c: {
            req() { return player.supernova.times.gte(1) },
            reqDesc: `1次超新星。`,
            desc: `Start generating 0.1 Neutron Star per second (not affected by offline production).`,
            cost: E(0),
        },
        sn1: {
            branch: ["c"],
            desc: `Tickspeed affects Neutron Star gain at a reduced rate.`,
            cost: E(10),
            effect() {
                let x = player.tickspeed.add(1).pow(0.25)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        sn2: {
            branch: ["sn1"],
            desc: `Supernova boosts Neutron Star gain.`,
            cost: E(350),
            effect() {
                let sn = player.supernova.times
                if (!hasTree("qu4")) sn = sn.softcap(15,0.8,0).softcap(25,0.5,0)
                let x = E(2).add(hasTree("sn4")?tmp.supernova.tree_eff.sn4:0).pow(sn)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        sn3: {
            branch: ["sn2"],
            desc: `Blue star boost Neutron star gain at a reduced rate.`,
            req() { return player.supernova.times.gte(6) },
            reqDesc: `6次超新星。`,
            cost: E(50000),
            effect() {
                let x = player.stars.generators[4].max(1).log10().add(1)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        sn4: {
            branch: ["sn3"],
            desc: `Tree “sn2”'s effect base is increased by Supernova.`,
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(13) },
            reqDesc: `13次超新星。`,
            cost: E(1e8),
            effect() {
                let x = player.supernova.times.mul(0.1).softcap(1.5,0.75,0)
                if (hasElement(112)) x = x.add(2)
				if(hasTree('sn6'))x = Decimal.pow(10,player.supernova.times.pow(2));
                return x
            },
            effDesc(x) { return "增加"+format(x)+((x.gte(1.5) && !hasTree('sn6'))?"<span class='soft'>(softcapped)</span>":"") },
        },
        sn5: {
            branch: ["sn4"],
            desc: `Mass boosts Neutron Stars gain.`,
            unl() { return quUnl() },
            cost: E('e450'),
            effect() {
                let x = player.mass.add(1).log10().add(1).pow(2)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        sn6: {
            branch: ["sn4"],
            desc: `Neutron Stars is raised to a power based on Supernovas, and [sn4]'s effect is better.`,
            unl() { return hasElement(118) },
            cost: E('e1.35e12'),
            effect() {
                let x = player.supernova.times.add(10).log10();
				if(hasElement(219))x = player.supernova.times.add(1);
                return x
            },
            effDesc(x) { return "^"+format(x) },
        },
        m1: {
            branch: ["c"],
            desc: `Neutron star multiplies Mass gain.`,
            cost: E(100),
            effect() {
                let x = E(1e100).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return format(x)+"倍"+(x.max(1).log(1e100).gte(1e3)?"<span class='soft'>(softcapped)</span>":"") },
        },
        m2: {
            branch: ["m1"],
            desc: `Multiplies the Mass requirement for softcap^2 by 1.5`,
            cost: E(800),
        },
        m3: {
            branch: ["m2"],
            unl() { return player.supernova.fermions.unl && hasTree("fn1") },
            desc: `Mass gain softcap^2-3 starts later based on Supernovas.`,
            cost: E(1e46),
            effect() {
                let x = player.supernova.times.mul(0.0125).add(1)
                return x
            },
            effDesc(x) { return "延迟^"+format(x)+"" },
        },
        t1: {
            branch: ["m1", 'rp1'],
            req() { return player.supernova.chal.noTick && player.mass.gte(E("1.5e1.650056e6").pow(hasTree('bh2')?1.46:1)) },
            reqDesc() {return `在超新星中，未购买过时间速度的前提下，到达${formatMass(E("1.5e1.650056e6").pow(hasTree('bh2')?1.46:1))}的质量。您仍然可以通过宇宙射线获得免费时间速度升级。`},
            desc: `Tickspeed Power is raised to the 1.15th.`,
            cost: E(1500),
        },
        rp1: {
            branch: ["c"],
            desc: `Neutron Stars multiplies Rage Powers gain`,
            cost: E(200),
            effect() {
                let x = E(1e50).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return format(x)+"倍"+(x.max(1).log(1e50).gte(1e3)?"<span class='soft'>(softcapped)</span>":"") },
        },
        bh1: {
            branch: ["c"],
            desc: `Neutron Star multiplies Dark Matters gain.`,
            cost: E(400),
            effect() {
                let x = E(1e35).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return format(x)+"倍"+(x.max(1).log(1e35).gte(1e3)?"<span class='soft'>(softcapped)</span>":"") },
        },
        bh2: {
            branch: ['bh1'],
            req() { return player.supernova.chal.noBHC && player.bh.mass.gte("1.5e1.7556e4") },
            reqDesc() {return `在超新星中，未购买过黑洞压缩器的前提下，到达${format("e1.75e4")}宇宙的黑洞质量。`},
            desc: `BH Condenser power is raised to the 1.15th.`,
            cost: E(1500),
        },
        s1: {
            branch: ["c"],
            desc: `Neutron Star boosts last star gain.`,
            cost: E(400),
            effect() {
                let x = player.supernova.stars.add(1).pow(1.4)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        s2: {
            branch: ["s1"],
            req() { return player.supernova.times.gte(3) },
            reqDesc: `3次超新星。`,
            desc: `Star boost's Tetr's softcap is 50% weaker.`,
            cost: E(2500),
        },
        s3: {
            branch: ["s2"],
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4次超新星。`,
            desc: `Star generators are stronger based on Supernova.`,
            cost: E(10000),
            effect() {
                let x = player.supernova.times.max(0).root(10).mul(0.1).add(1)
                return x
            },
            effDesc(x) { return "^"+format(x) },
        },
        s4: {
            branch: ["s3"],
            req() { return player.supernova.times.gte(6) },
            reqDesc: `6次超新星。`,
            desc: `Beyond unlocking stars, Star Unlocker will transform into Booster.`,
            cost: E(1e5),
        },
        s5: {
            unl() { return player.inf.times.gte(1) },
            branch: ["s4"],
            desc: `Disable collapsed stars gain softcap.`,
            cost: E("ee25"),
        },
        qol1: {
            req() { return player.supernova.times.gte(2) },
            reqDesc: `2次超新星。`,
            desc: `Start with Silicon-14 & Argon-18 unlocked. You can now automatically buy Elements & Atom upgrades.`,
            cost: E(1500),
        },
        qol2: {
            branch: ["qol1"],
            req() { return player.supernova.times.gte(3) },
            reqDesc: `3次超新星。`,
            desc: `Start with Chromium-24 and Atom upgrade 6 unlocked.`,
            cost: E(2000),
        },
        qol3: {
            branch: ["qol2"],
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4次超新星。`,
            desc: `Start with Techntium-43 unlocked, improve their element better. You can automatically gain Relativistic particles from mass.`,
            cost: E(10000),
        },
        qol4: {
            branch: ["qol3"],
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(12) },
            reqDesc: `12次超新星。`,
            desc: `You can now automatically buy Star unlockers & boosters.`,
            cost: E(1e8),
        },
        qol5: {
            branch: ["qol4"],
            req() { return player.supernova.times.gte(16) },
            reqDesc: `16次超新星。`,
            desc: `Tetrs no longer resets anything.`,
            cost: E(1e13),
        },
        qol6: {
            branch: ["qol5"],
            req() { return player.supernova.times.gte(17) },
            reqDesc: `17次超新星。`,
            desc: `While in any challenge, you can now automatically complete it before exiting.`,
            cost: E(1e15),
        },
        qol7: {
            branch: ["qol6"],
            unl() { return player.supernova.fermions.unl && hasTree("fn2") },
            req() { return player.supernova.times.gte(40) },
            reqDesc: `40次超新星。`,
            desc: `You can now automatically buy Photon & Gluon upgrades, they no longer spent their amount.`,
            cost: E(1e48),
        },
        qol8: {
            branch: ["unl1"],
            req() { return player.supernova.times.gte(60) },
            reqDesc: `60次超新星。`,
            desc: `You can now automatically Pent up, Pent no longer resets anything.`,
            cost: E(1e78),
        },
        qol9: {
            branch: ["unl1"],
            req() { return player.supernova.times.gte(78) },
            reqDesc: `78次超新星。`,
            desc: `You can now automatically buy Radiation Boosters, they no longer spent.`,
            cost: E(1e111),
        },
        chal1: {
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4次超新星。`,
            desc: `Add 100 more C7 & C8 maximum completions.`,
            cost: E(6000),
        },
        chal2: {
            branch: ["chal1"],
            req() {
                for (let x = 1; x <= 4; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(E('e2.05e6').mul(1.5e56))
            },
            reqDesc() { return `在超新星中，未完成过挑战1-挑战4的前提下，到达${format('e2.05e6')}宇宙的质量。` },
            desc: `Keep challenge 1-4 completions on reset.`,
            cost: E(1e4),
        },
        chal3: {
            branch: ["chal1"],
            req() {
                for (let x = 5; x <= 8; x++) if (player.chal.comps[x].gte(1)) return false
                return player.bh.mass.gte(E('e1.75e4').mul(1.5e56))
            },
            reqDesc() { return `在超新星中，未完成过挑战5-挑战8的前提下，到达${format('e1.75e4')}宇宙的黑洞质量。` },
            desc: `Keep challenge 5-8 completions on reset.`,
            cost: E(1e4),
        },
        chal4: {
            branch: ["chal2","chal3"],
            desc: `Unlock new challenge.`,
            cost: E(1.5e4),
        },
        chal4a: {
            unl() { return player.supernova.post_10 },
            branch: ["chal4"],
            desc: `Make 9th Challenges effect better.`,
            cost: E(1e8),
        },
        chal4b: {
            unl() { return quUnl() },
            branch: ["chal4"],
            desc: `Add 100 more C9 completions.`,
            cost: E('e480'),
        },
        chal5: {
            branch: ["chal4"],
            desc: `Unlock new challenge.`,
            cost: E(1e17),
        },
        chal6: {
            unl() { return tmp.radiation.unl },
            branch: ["chal5"],
            desc: `Unlock new challenges.`,
            cost: E(1e88),
        },
        chal7: {
            branch: ["chal6"],
            desc: `Unlock 12th Challenge.`,
            cost: E(1e200),
        },
        chal7a: {
            unl() { return hasTree("unl3") },
            branch: ["chal7"],
            desc: `Make 12th Challenges effect better.`,
            cost: E('e900'),
        },
        chal8: {
            unl() { return player.qu.rip.first },
            branch: ["chal7"],
            desc: `Add 200 more C9-12 completions.`,
            cost: E('e35000'),
        },
        chal9: {
			qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["chal8"],
            desc: `Add 2000 more C9 completions.`,
            cost: E(1e106),
        },
        chal10: {
			qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["chal9"],
            desc: `Add 500 more C10-11 completions.`,
            cost: E(1e120),
        },
        chal11: {
			qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["chal10"],
            desc: `Add 500 more C9-11 completions.`,
            cost: E(1e144),
        },
        chal12: {
			qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["chal11"],
            desc: `Add 1900 more C9 completions, and add 3500 more C10-11 completions.`,
            cost: E(1e156),
        },
        chal13: {
			qf: true,
            unl() { return player.inf.times.gte(1) },
            branch: ["chal12"],
            desc: `Add 5000 more C9-11 completions.`,
            cost: E("1e411"),
        },
        chal14: {
			qf: true,
            unl() { return player.inf.times.gte(1) },
            branch: ["chal13"],
            desc: `Add 900 more C12 completions.`,
            cost: E("1e471"),
        },
        gr1: {
            branch: ["bh1"],
            desc: `BH Condensers power boost Cosmic Rays power.`,
            req() { return player.supernova.times.gte(7) },
            reqDesc: `7次超新星。`,
            cost: E(1e6),
            effect() {
                let x = tmp.bh?tmp.bh.condenser_eff.pow.max(1).root(3):E(1)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        gr2: {
            unl() { return player.supernova.fermions.unl },
            branch: ["gr1"],
            desc: `Cosmic Rays Power is raised to 1.25th power.`,
            cost: E(1e20),
        },
        bs1: {
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(15) },
            reqDesc: `15次超新星。`,
            desc: `Tickspeed affect Higgs Bosons gain at a reduced rate.`,
            cost: E(1e13),
            effect() {
                let x = player.tickspeed.add(1).pow(0.6)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        bs2: {
            branch: ["bs1"],
            desc: `Photon, Gluon powers up each other.`,
            cost: E(1e14),
            effect() {
                let x = expMult(player.supernova.bosons.photon,hasElement(113) ? 0.95 : 1/2,2).max(1)
                let y = expMult(player.supernova.bosons.gluon,hasElement(113) ? 0.95 : 1/2,2).max(1)
                return [x,y]
            },
            effDesc(x) { return "光子获取速度变为原来的"+format(x[1])+"倍，胶子获取速度变为原来的"+format(x[0])+"倍" },
        },
        bs3: {
            branch: ["bs1"],
            desc: `Neutrons gain is affected by Graviton's effect at a reduced rate.`,
            cost: E(1e14),
            effect() {
                let x = tmp.bosons.effect.graviton[0].add(1).root(2)
                return x.softcap('e1000',1/3,0)
            },
            effDesc(x) { return format(x)+"倍"+x.softcapHTML('e1000') },
        },
        bs4: {
            unl() { return player.supernova.fermions.unl },
            branch: ["bs2"],
            desc: `Raise Z Bosons gain to the 1.5th power.`,
            cost: E(1e24),
        },
        bs5: {
            unl() { return player.qu.en.unl },
            branch: ["bs4"],
            desc: `Z Bosons also affect BHC + CR powers.`,
            cost: E('e1100'),
        },
        fn1: {
            unl() { return player.supernova.fermions.unl },
            branch: ["bs1"],
            desc: `Tickspeed affect each Fermions gain at a reduced rate.`,
            cost: E(1e27),
            effect() {
                let x = E(1.25).pow(player.tickspeed.pow(0.4))
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        fn2: {
            branch: ["fn1"],
            req() { return player.mass.div('1.5e56').gte("ee6") && player.md.active && FERMIONS.onActive("01") },
            reqDesc() { return `当选择[下夸克]并进行质量膨胀时，到达${formatMass(E('e1e6').mul(1.5e56))}的质量。` },
            desc: `Unlock 2 new types of U-Quark & U-Fermion.`,
            cost: E(1e33),
        },
        fn3: {
            branch: ["fn1"],
            req() { return player.supernova.fermions.points[0].gte(1e7) || player.supernova.fermions.points[1].gte(1e7) },
            reqDesc() { return `任意费米子到达${format(1e7)}。` },
            desc: `Super Fermion's Tier scaling is 7.5% weaker.`,
            cost: E(1e30),
        },
        fn4: {
            unl() { return hasTree("fn2") },
            branch: ["fn1"],
            desc: `使光子和胶子升级2的效果略微增强。`,
            cost: E(1e39),
        },
        fn5: {
            unl() { return hasTree("fn2") },
            branch: ["fn1"],
            req() { return player.atom.quarks.gte("e12500") && FERMIONS.onActive("10") },
            reqDesc() { return `当选择[电子]时，到达${format("e12500")}的夸克。` },
            desc: `[Electron] max tier is increased by 35. Its effect softcap is weaker.`,
            cost: E(1e42),
        },
        fn6: {
            branch: ["fn2"],
            req() { return player.mass.gte(uni('e4e4')) && FERMIONS.onActive("02") && CHALS.inChal(5) },
            reqDesc() { return `当选择[粲夸克]并进行挑战5时，到达${formatMass(uni("e4e4"))}的质量。` },
            desc: `Unlock 2 new more types of U-Quark & U-Fermion.`,
            cost: E(1e48),
        },
        fn7: {
            branch: ["fn6"],
            desc: `Unlock 2 new more types of U-Quark & U-Fermion.`,
            cost: E(1e90),
        },
        fn8: {
            branch: ["fn7"],
            desc: `Unlock 2 new final types of U-Quark & U-Fermion.`,
            cost: E(1e159),
        },
        fn9: {
            branch: ["fn1"],
            desc: `[Strange] & [Neutrino] max tier is increased by 2.`,
            cost: E(1e166),
        },
        fn10: {
            unl() { return PRIM.unl() },
            branch: ["fn5"],
            req() { return player.atom.points.gte("e1.5e8") && FERMIONS.onActive("10") && CHALS.inChal(9) },
            reqDesc() { return `当选择[电子]并进行挑战9时，到达${format("e1.5e8")}的原子。` },
            desc: `Break [Electron] maximum tier, its effect is overpowered.`,
            cost: E('e600'),
        },
        fn11: {
            unl() { return PRIM.unl() },
            branch: ["fn9"],
            desc: `[Strange], [Top], [Bottom], [Neutrino], [Neut-Muon] max tier is increased by 5.`,
            cost: E('e680'),
        },
        fn12: {
            branch: ["fn3"],
            desc: `Pre-Meta Fermion's Tier is 10% weaker.`,
            cost: E('e960'),
        },
        fn13: {
            unl() { return player.atom.elements.includes(118) },
            branch: ["fn12"],
            desc: `Remove [Neut-Muon]'s Hardcap.`,
            cost: E('1e3500000'),
        },
        fn14: {
            unl() { return player.atom.elements.includes(118) },
            branch: ["fn11"],
            desc: `[Strange], [Top], [Neutrino], [Neut-Muon] max tier is increased by 69. [Strange], [Top], [Neutrino], [Neut-Muon] Free Tiers from Epsilon Particles is unhardcapped.`,
            cost: E('1e3900000'),
        },
        fn15: {
            unl() { return player.atom.elements.includes(118) },
            branch: ["fn14","fn8"],
            desc: `[Bottom], [Neut-Tau] Free Tiers from Epsilon Particles is unhardcapped.`,
            cost: E('1e9000000'),
        },
        fn16: {
            unl() { return player.atom.elements.includes(118) },
            branch: ["fn14"],
            desc: `Break [Neutrino] Max Tier.`,
            cost: E('1e20000000'),
        },
        fn17: {
            unl() { return player.atom.elements.includes(118) },
            branch: ["fn16"],
            desc: `Break [Neut-Muon] Max Tier.`,
            cost: E('1e32000000'),
        },
        fn18: {
            unl() { return player.atom.elements.includes(118) },
            branch: ["fn13"],
            desc: `[Bottom]'s Hardcap becomes a softcap.`,
            cost: E('e2.5e13'),
        },
        d1: {
            unl() { return hasTree("fn6") },
            branch: ["rp1"],
            desc: `Generating Relativistic particles outside Mass dilation is 25% stronger.`,
            cost: E(1e51),
        },
        rad1: {
            unl() { return tmp.radiation.unl },
            desc: `Gain more frequency based on Supernova, any more radiation if you unlocked next radiation.`,
            cost: E(1e54),
            effect() {
                let x = player.supernova.times.add(1)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        rad2: {
            branch: ["rad1"],
            desc: `Gain x10 any more Radiation.`,
            cost: E(1e72),
        },
        rad3: {
            branch: ["rad1"],
            desc: `Radiation Boosts are 1.1x cheaper.`,
            cost: E(1e86),
        },
        rad4: {
            branch: ["rad2"],
            desc: `All Meta-Boosts are twice effective.`,
            cost: E(1e118),
        },
        rad5: {
            branch: ["rad3"],
            desc: `All Radiation gains are increased by 10% for every Supernovas you have become.`,
            cost: E(1e170),
            effect() {
                let x = E(1.1).pow(player.supernova.times)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        rad6: {
            unl() { return PRIM.unl() },
            branch: ["rad4"],
            desc: `Bonus radiation boosts are stronger based on radiation type.`,
            cost: E('e490'),
        },

        qf1: {
            unl() { return quUnl() },
            desc: `Gain more Quantum Foams based on Supernovas.`,
            cost: E(1e290),
            effect() {
                let x = player.supernova.times.root(2).div(10).add(1)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        qf2: {
            unl() { return PRIM.unl() },
            branch: ["qf1"],
            desc: `Quantum Foams are boosted by Neutron Stars.`,
            cost: E('e735'),
            effect() {
                let x = player.supernova.stars.add(1).log10().add(1).root(3)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        qf3: {
            unl() { return hasTree('unl3') },
            branch: ["qf1"],
            desc: `Quantum Foams are boosted by Blueprint Particles.`,
            cost: E('e850'),
            effect() {
                let x = player.qu.bp.add(1).log10().add(1).pow(2)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        qf4: {
            branch: ["qf3"],
            desc: `Quantum Shard's base is increased by 0.5.`,
            cost: E('e1000'),
        },

        // Quatnum

        qu0: {
            unl() { return quUnl() },
            qf: true,
            desc: `Good luck with new era!`,
            cost: E(0),
        },
        qu1: {
            qf: true,
            branch: ["qu0"],
            desc: `Fermion's requirement is decreased by 20%.`,
            cost: E(1),
        },
        qu2: {
            qf: true,
            branch: ["qu0"],
            desc: `W+ Boson's 1st effect is overpowered.`,
            cost: E(1),
        },
        qu3: {
            qf: true,
            branch: ["qu0"],
            desc: `From BH the formula's softcap is 30% weaker.`,
            cost: E(1),
        },
        qu4: {
            qf: true,
            branch: ["qu1", 'qu2', 'qu3'],
            desc: `Remove effect's softcaps from [sn2].`,
            cost: E(35),
        },
        qu5: {
            qf: true,
            unl() { return PRIM.unl() },
            branch: ['qu4'],
            desc: `Blueprint Particles & Chromas are affected by Tickspeed Effect at a reduced rate.`,
            cost: E(100),
            effect() {
                let x = tmp.tickspeedEffect?tmp.tickspeedEffect.eff.add(1).log10().add(1).log10().add(1).pow(3):E(1)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        qu6: {
            qf: true,
            branch: ['qu5'],
            desc: `Quantum times boost Cosmic string's power.`,
            cost: E(1e3),
            effect() {
                let x = player.qu.times.add(1).log10().add(1)
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        qu7: {
            qf: true,
            unl() { return hasTree("unl3") },
            branch: ['qu6'],
            desc: `Gain more Quantizes based on Quantum Shards.`,
            cost: E(1e15),
            effect() {
                let x = player.qu.qc.shard+1
                return x
            },
            effDesc(x) { return format(x,0)+"倍" },
        },
        qu8: {
            qf: true,
            
            branch: ['qu7'],
            desc: `Chromas are affected by Quantum Shard’s effect.`,
            cost: E(1e21),
            effect() {
                let x = tmp.qu.qc_s_eff.max(1)
                return x
            },
            effDesc(x) { return format(x,1)+"倍" },
        },
        qu9: {
            unl() { return player.qu.en.unl },
            qf: true,
            branch: ['qu8'],
            desc: `Gain more Quantizes based on total Primordium Particles.`,
            cost: E(1e24),
            effect() {
                let x = player.qu.prim.theorems.add(1)
                return x
            },
            effDesc(x) { return format(x,0)+"倍" },
        },
        qu10: {
            qf: true,
            branch: ['qu9'],
            desc: `Higgs Boson's effect is increased by 3.3% for every OoM of Blueprint Particles.`,
            cost: E(1e32),
            effect() {
                let x = E(1.0333).pow(player.qu.bp.add(1).log10().softcap(70,0.5,0))
                return x
            },
            effDesc(x) { return format(x)+"倍" },
        },
        qu11: {
            qf: true,
            branch: ['qu10'],
            desc: `Quantum Foams gain formula is better.`,
            cost: E(1e43),
        },
        qu12: {
            qf: true,
            unl() { return hasElement(118) },
            req() { return player.prestigeMass.gte(1.619e20) },
            reqDesc: `Reach 1 MME of Prestige mass.`,
            branch: ['br3'],
            desc: `Effect of Prestige mass is better.`,
            cost: E(1e237),
        },
        qu_qol1: {
            qf: true,
            unl() { return quUnl() },
            req() { return player.qu.times.gte(4) },
            reqDesc: `前往量子4次。`,
            desc: `You can now automatically purchase supernova tree except with cost of quantum foam.`,
            cost: E(3),
        },
        qu_qol2: {
            qf: true,
            branch: ["qu_qol1"],
            req() {
                for (let x = 0; x < 6; x++) if (player.supernova.fermions.tiers[0][x].gte(1)) return false
                return player.supernova.times.gte(81)
            },
            reqDesc: `在前往量子后，未获得任何U-夸克阶层的前提下，有81次成为超新星。`,
            desc: `Keep U-Quark Tiers on going Quantum.`,
            cost: E(4),
        },
        qu_qol3: {
            qf: true,
            branch: ["qu_qol1"],
            req() {
                for (let x = 1; x <= 4; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(mlt(1e4))
            },
            reqDesc() { return `在前往量子后，未完成过挑战1-挑战4的前提下，到达${formatMass(mlt(1e4))}质量。` },
            desc: `You can now automatically complete Challenges 1-4 any Challenge.`,
            cost: E(4),
        },
        qu_qol4: {
            qf: true,
            branch: ["qu_qol1"],
            desc: `You can now automatically become a supernova, it no longer resets anything.`,
            cost: E(4),
        },
        qu_qol5: {
            qf: true,
            branch: ["qu_qol1"],
            req() {
                for (let x = 5; x <= 8; x++) if (player.chal.comps[x].gte(1) && x != 7) return false
                return player.mass.gte(mlt(1.35e4))
            },
            reqDesc() { return `在前往量子后，未完成过挑战5、挑战6和挑战8的前提下，到达${formatMass(mlt(1.35e4))}质量。` },
            desc: `You can now automatically complete Challenges 5-8 any Challenge.`,
            cost: E(4),
        },
        qu_qol6: {
            qf: true,
            branch: ["qu_qol1"],
            req() {
                for (let x = 0; x < 6; x++) if (player.supernova.fermions.tiers[1][x].gte(1)) return false
                return player.supernova.times.gte(42)
            },
            reqDesc: `在前往量子后，未获得任何U-轻子阶层的前提下，有42次成为超新星。`,
            desc: `Keep U-Lepton Tiers on going Quantum.`,
            cost: E(4),
        },
        qu_qol7a: {
            qf: true,
            branch: ["qu_qol7"],
            unl() { return hasElement(118) },
            desc: `You can now automatically complete Challenges 9-12 any Challenge.`,
            cost: E(1e147),
        },
        qu_qol7: {
            qf: true,
            branch: ["qu_qol3","qu_qol5"],
            req() {
                for (let x = 9; x <= 12; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(mlt(5e3)) && FERMIONS.onActive("05")
            },
            reqDesc() { return `在前往量子后，未完成过挑战9-挑战12，且选择[底夸克]时，到达${formatMass(mlt(5e3))}质量。` },
            desc: `Keep challenge 9-12 completions on going Quantum.`,
            cost: E(25),
        },
        qu_qol8: {
            qf: true,
            branch: ["unl3"],
            req() { return player.qu.qc.shard >= 15 },
            reqDesc() { return `获得15量子碎片。` },
            desc: `You can now automatically get all Fermions Tiers outside any Fermion, except during Quantum Challenge.`,
            cost: E(1e11),
        },
        qu_qol8a: {
            unl() { return player.md.break.active },
            qf: true,
            branch: ["qu_qol8"],
            desc: `Make [qu_qol8] worked inside Quantum Challenge or Big Rip.`,
            cost: E(1e75),
        },
        qu_qol9: {
            qf: true,
            branch: ["qu_qol8"],
            req() { return player.qu.qc.shard >= 24 },
            reqDesc() { return `获得24量子碎片。` },
            desc: `Start with Polonium–84 unlocked when entering in Quantum Challenge.`,
            cost: E(1e17),
        },
        qu_qol10: {
            qf: true,
            branch: ["unl2"],
            unl() { return hasElement(118) },
            desc: `Automatically evaporate resources. (Stronger than manual)`,
            cost: E(1e111),
        },
        qu_qol11: {
            qf: true,
            branch: ["unl3"],
            unl() { return hasElement(118) },
            desc: `Automatically gain Quantum times, gain 10x more Quantum times and passive Quantum Foams.`,
            cost: E(1e118),
        },
        qu_qol12: {
            qf: true,
            branch: ["unl4"],
            unl() { return hasElement(118) },
            desc: `You can gain Death Shards outside Big Rips. Plutonium-94 don't work outside Big Rips.`,
            cost: E(5e130),
        },
        qu_qol13: {
            qf: true,
            branch: ["qu_qol12"],
            unl() { return hasElement(118) },
            desc: `You can gain Relativistic Energy outside Big Rips. Autobuy Break Dilation Upgrades.`,
            cost: E(5e137),
        },
        prim1: {
            qf: true,
            branch: ["qu5"],
            desc: `Primordium Theorem’s base requirement is reduced by 1.`,
            cost: E(200),
        },
        prim2: {
            qf: true,
            branch: ["prim1"],
            desc: `Theta Particle’s second effect is now added.`,
            cost: E(500),
        },
        prim3: {
            qf: true,
            unl() { return hasTree("unl3") },
            branch: ["prim2"],
            desc: `Epsilon Particle’s second effect is now added, stronger if you are in Quantum Challenge.`,
            cost: E(1e16),
        },
        prim3a: {
            qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["prim3"],
            desc: `Epsilon Particle’s second effect is stronger if you are not in Quantum Challenge.`,
            cost: E(1e200),
        },
        prim4: {
            qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["prim3"],
            desc: `You can't gain Delta Particles from Primordium Theorem now. Instead, Add Free Delta Particles equals to your total Primordium Theorems.`,
            cost: E(1e105),
        },
        prim5: {
            qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["prim4"],
            desc: `You can't gain Omega Particles from Primordium Theorem now. Instead, Add Free Omega Particles equals to your total Primordium Theorems.`,
            cost: E(1e116),
        },
        prim6: {
            qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["prim5"],
            desc: `You can't gain Alpha Particles from Primordium Theorem now. Instead, Add Free Alpha Particles equals to your total Primordium Theorems.`,
            cost: E(1e147),
        },
        prim7: {
            qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["prim6"],
            desc: `You can't gain Sigma Particles from Primordium Theorem now. Instead, Add Free Sigma Particles equals to your total Primordium Theorems.`,
            cost: E(1e178),
        },
        prim8: {
            qf: true,
            unl() { return player.atom.elements.includes(118) },
            branch: ["prim7"],
            desc: `Change the mechanics of Primordium.`,
            cost: E(1e235),
        },
        qc1: {
            qf: true,
            unl() { return hasTree("unl3") },
            branch: ['qu5'],
            desc: `Mass gain softcap^4 starts later based on Quantum Shards.`,
            cost: E(1e10),
            effect() {
                let x = (player.qu.qc.shard+1)**0.75
                return x
            },
            effDesc(x) { return "延迟^"+format(x)+"" },
        },
        qc2: {
            unl() { return player.qu.en.unl },
            qf: true,
            branch: ['qc1'],
            req() { return tmp.qu.qc_s >= 70 && player.mass.gte(uni('ee5')) && QCs.active() },
            reqDesc() { return `使用可以获得70量子碎片的挑战限制(升级加成不计入)进入量子挑战，并到达${formatMass(uni('ee5'))}质量。` },
            desc: `Get 1 extra shard when a nerf reach 10.`,
            cost: E(1e27),
        },
        qc3: {
            unl() { return hasTree('unl4') },
            qf: true,
            branch: ['qc2'],
            req() { return player.qu.qc.shard >= 88 },
            reqDesc() { return `获得88量子碎片。` },
            desc: `Quantum Shard's base is increased by Prestige Base.`,
            cost: E(1e78),
            effect() {
                let x = (tmp.prestiges.base||E(1)).add(1).log10().div(10)
                return x
            },
            effDesc(x) { return "+"+format(x) },
        },
        qc4: {
            unl() { return player.atom.elements.includes(118) },
            qf: true,
            branch: ['qc3'],
            desc: `Increase maximum QC nerf tier based on your Quantum Shards.`,
            cost: E(1e104),
            effect() {
                let x = Math.min(Math.floor((player.qu.qc.shard-80)/8),40);
                return x
            },
            effDesc(x) { return "+"+format(x,0) },
        },
        qc5: {
            unl() { return player.atom.elements.includes(118) },
            qf: true,
            branch: ['qc4'],
            desc: `Pre-Quantum Global Speed is boosted by your Quantum Shards.`,
            cost: E(1e135),
            effect() {
                let x = Decimal.pow(1.07,player.qu.qc.shard);
                return x
            },
            effDesc(x) { return format(x,0)+"x" },
        },
        qc6: {
            unl() { return player.atom.elements.includes(118) },
            qf: true,
            branch: ['qc5'],
            desc: `Quantum Shard's base is increased by Prestige mass.`,
            cost: E(1e158),
            effect() {
                let x = player.prestigeMass.add(1).log10().add(1).log10();
                return x
            },
            effDesc(x) { return "+"+format(x) },
        },
        qc7: {
            unl() { return player.atom.elements.includes(118) },
            qf: true,
            branch: ['qc6'],
            desc: `Quantum Shard boost Prestige mass gain.`,
            cost: E(1e224),
            effect() {
                let x = Decimal.pow(player.qu.qc.shard+1,0.6);
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qc8: {
            unl() { return player.atom.elements.includes(118) },
            qf: true,
            branch: ['qc3'],
            req() { return player.qu.qc.shard >= 144 },
            reqDesc() { return `Get 144 Quantum Shards.` },
            desc: `Quantum Shard boost Prestige base exponent.`,
            cost: E(1e269),
            effect() {
                let x = (player.qu.qc.shard**2)*4e-7;
                return x
            },
            effDesc(x) { return "+"+format(x) },
        },
        en1: {
            unl() { return player.qu.rip.first },
            qf: true,
            branch: ['qu5'],
            desc: `Evaporating frequency & mass of black hole is twice effective, its effects are stronger.`,
            cost: E(1e55),
        },
        en2: {
            unl() { return player.atom.elements.includes(118) },
            qf: true,
            branch: ['en1'],
            desc: `Quantum Shard boost Entropy gain.`,
            cost: E(1e119),
            effect() {
                let x = (player.qu.qc.shard**2/100+1)
                return x
            },
            effDesc(x) { return "x"+format(x) },
        },
        br1: {
            unl() { return player.qu.rip.first },
            qf: true,
            branch: ['qu5'],
            req() { return tmp.qu.qc_s >= 76 && player.mass.gte(uni('e7500')) && QCs.active() },
            reqDesc() { return `使用可以获得76量子碎片的挑战限制(升级加成不计入)进入量子挑战，并到达${formatMass(uni('e7500'))}质量。` },
            desc: `Quantum Shard boost Death Shard gain.`,
            cost: E(1e58),
            effect() {
                let x = (player.qu.qc.shard+1)**0.5
                return x
            },
            effDesc(x) { return "x"+format(x) },
        },
        br2: {
            unl() { return hasElement(118) },
            qf: true,
            branch: ['br1'],
            desc: `All elements can be bought in Big Rip.`,
            cost: E(1e114),
        },
        br3: {
            unl() { return hasElement(118) },
            qf: true,
            branch: ['qu11'],
            req() { return player.supernova.times.gte(32) && player.qu.rip.active },
            reqDesc() { return `Reach 32 Supernovas in Big Rip.` },
            desc: `When outside Big Rips, Plutonium-94 works, but 90% weaker.`,
            cost: E(1e157),
        },
        pm1: {
            unl() { return hasPrestige(1,10) },
            branch: [],
            desc: `Neutron Star boost Prestige mass gain.`,
            cost: E("1e300000000"),
            effect() {
                let x = player.supernova.stars.add(1).log10().add(1).log10();
                return x
            },
            effDesc(x) { return "x"+format(x) },
        },
        pm2: {
            unl() { return hasPrestige(1,10) },
            branch: ['pm1'],
            desc: `Supernovas boost Prestige mass gain.`,
            cost: E("e1e15"),
            effect() {
                let x = player.supernova.times.add(1).log10().add(1).log10().add(1).pow(3);
                return x
            },
            effDesc(x) { return "x"+format(x) },
        },
        im1: {
            unl() { return player.inf.times.gte(1) },
            branch: ['pm2'],
            desc: `Supernovas boost Infinity mass gain.`,
            cost: E("e1e25"),
            effect() {
                let x = player.supernova.times.add(1).log10().add(1).log10().add(1);
                return x
            },
            effDesc(x) { return "x"+format(x) },
        },

        // Other

        unl1: {
            branch: ["qol7"],
            unl() { return hasTree("fn6") },
            req() { return player.supernova.times.gte(44) },
            reqDesc: `44次超新星。`,
            desc: `Unlock Radiation.`,
            cost: E(5e52),
        },
        unl2: {
            qf: true,
            branch: ["qu_qol7"],
            req() { return player.qu.times.gte(20) },
            reqDesc: `前往量子20次。`,
            desc: `Unlock Primordium.`,
            cost: E(50),
        },
        unl3: {
            qf: true,
            branch: ["unl2"],
            req() { return player.qu.times.gte(200) },
            reqDesc: `前往量子200次。`,
            desc: `Unlock Quantum Challenge.`,
            cost: E(1e6),
        },
        unl4: {
            qf: true,
            branch: ["qu_qol9"],
            req() { return player.qu.qc.shard >= 66 },
            reqDesc: `66量子碎片。`,
            desc: `Unlock Big Rip.`,
            cost: E(1e42),
        },
        /*
        x: {
            unl() { return true },
            req() { return true },
            reqDesc: ``,
            desc: `Placeholder.`,
            cost: EINF,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        */
    },
}

function hasTree(id) { return player.supernova.tree.includes(id) }

function treeEff(id,def=1) { return tmp.supernova.tree_eff[id]||E(def) }

function setupTreeHTML() {
    let tree_table = new Element("tree_table")
    let tree_tab_table = new Element("tree_tab_table")
	let table = ``
    let table2 = ``
    for (let j = 0; j < TREE_TAB.length; j++) {
        table2 += `
        <div style="width: 145px">
            <button onclick="tmp.tree_tab = ${j}" class="btn_tab" id="tree_tab${j}_btn">${TREE_TAB[j].title}<b id="tree_tab${j}_notify" style="color: red"> [!]</b></button>
        </div>
        `
        table += `<div id="tree_tab${j}_div">`
        for (let i = 0; i < TREE_IDS.length; i++) {
            table += `<div class="tree_table_column">`
            for (let k = 0; k < TREE_IDS[i][j].length; k++) {
                let id = TREE_IDS[i][j][k]
                let option = id == "" ? `style="visibility: hidden"` : ``
                let img = TREE_UPGS.ids[id]?`<img src="images/tree/${id}.png">`:""
                table += `<button id="treeUpg_${id}" class="btn_tree" onclick="TREE_UPGS.buy('${id}'); tmp.supernova.tree_choosed = '${id}'" ${option}>${img}</button>`
            }
            table += `</div>`
        }
        table += `</div>`
    }

	tree_table.setHTML(table)
    tree_tab_table.setHTML(table2)
}

function retrieveCanvasData() {
	let treeCanv = document.getElementById("tree_canvas")
	if (treeCanv===undefined||treeCanv===null) return false;
    tree_canvas = treeCanv
	tree_ctx = tree_canvas.getContext("2d");
	return true;
}

function resizeCanvas() {
    if (!retrieveCanvasData()) return
	tree_canvas.width = 0;
	tree_canvas.height = 0;
	tree_canvas.width = tree_canvas.clientWidth
	tree_canvas.height = tree_canvas.clientHeight
}

function drawTreeHTML() {
    if (tmp.tab == 5) {
        if (tree_canvas.width == 0 || tree_canvas.height == 0) resizeCanvas()
        drawTree()
    }
}

function drawTree() {
	if (!retrieveCanvasData()) return;
	tree_ctx.clearRect(0, 0, tree_canvas.width, tree_canvas.height);
	for (let x in tmp.supernova.tree_had2[tmp.tree_tab]) {
        let id = tmp.supernova.tree_had2[tmp.tree_tab][x]
        let branch = TREE_UPGS.ids[id].branch||[]
        if (branch.length > 0 && tmp.supernova.tree_unlocked[id]) for (let y in branch) if (tmp.supernova.tree_unlocked[branch[y]]) {
			drawTreeBranch(branch[y], id)
		}
	}
}

function treeCanvas() {
    if (!retrieveCanvasData()) return
    if (tree_canvas && tree_ctx) {
        window.addEventListener("resize", resizeCanvas)

        tree_canvas.width = tree_canvas.clientWidth
        tree_canvas.height = tree_canvas.clientHeight
    }
}

const TREE_ANIM = ["Circle", "Square", "OFF"]
const CR = 5
const SR = 7.0710678118654755

function drawTreeBranch(num1, num2) {
    var start = document.getElementById("treeUpg_"+num1).getBoundingClientRect();
    var end = document.getElementById("treeUpg_"+num2).getBoundingClientRect();
    var x1 = start.left + (start.width / 2) - (document.body.scrollWidth-tree_canvas.width)/2;
    var y1 = start.top + (start.height / 2) - (window.innerHeight-tree_canvas.height);
    var x2 = end.left + (end.width / 2) - (document.body.scrollWidth-tree_canvas.width)/2;
    var y2 = end.top + (end.height / 2) - (window.innerHeight-tree_canvas.height);
    tree_ctx.lineWidth=10;
    tree_ctx.beginPath();
    let color = TREE_UPGS.ids[num2].qf?"#39FF49":"#00520b"
    let color2 = TREE_UPGS.ids[num2].qf?"#009C15":"#fff"
    tree_ctx.strokeStyle = hasTree(num2)?color:tmp.supernova.tree_afford[num2]?"#fff":"#333";
    tree_ctx.moveTo(x1, y1);
    tree_ctx.lineTo(x2, y2);
    tree_ctx.stroke();

    if (player.options.tree_animation != 2) {
        tree_ctx.fillStyle = hasTree(num2)?color2:"#888";
        let tt = [tmp.tree_time, (tmp.tree_time+1)%3, (tmp.tree_time+2)%3]
        for (let i = 0; i < 3; i++) {
            let [t, dx, dy] = [tt[i], x2-x1, y2-y1]
            let [x, y] = [x1+dx*t/3, y1+dy*t/3]
            tree_ctx.beginPath();
            if (player.options.tree_animation == 1) {
                let a = Math.atan2(y1-y2,dx)-Math.PI/4
                tree_ctx.moveTo(x+SR*Math.cos(a), y-SR*Math.sin(a))
                for (let j = 1; j <= 3; j++) tree_ctx.lineTo(x+SR*Math.cos(a+Math.PI*j/2), y-SR*Math.sin(a+Math.PI*j/2))
            } else if (player.options.tree_animation == 0) {
                tree_ctx.arc(x, y, CR, 0, Math.PI*2, true);
            }
            tree_ctx.fill();
        }
    }
}

function changeTreeAnimation() {
    player.options.tree_animation = (player.options.tree_animation + 1) % 3;
}

function updateTreeHTML() {
    let req = ""
    let t_ch = TREE_UPGS.ids[tmp.supernova.tree_choosed]
    if (tmp.supernova.tree_choosed != "") req = t_ch.req?`<span class="${t_ch.req()?"green":"red"}">${t_ch.reqDesc?"需满足："+(typeof t_ch.reqDesc == "function"?t_ch.reqDesc():t_ch.reqDesc):""}</span>`:""
    tmp.el.tree_desc.setHTML(
        tmp.supernova.tree_choosed == "" ? `<div style="font-size: 12px; font-weight: bold;"><span class="gray">(click any tree upgrade to show)</span></div>`
        : `<div style="font-size: 12px; font-weight: bold;"><span class="gray">(click again to buy if affordable)</span>${req}</div>
        <span class="sky"><b>[${tmp.supernova.tree_choosed}]</b>${t_ch.desc}</span><br>
        <span>Cost: ${format(t_ch.cost,2)} ${t_ch.qf?'Quantum foam':'Neutron star'}</span><br>
        <span class="green">${t_ch.effDesc?"目前效果："+t_ch.effDesc(tmp.supernova.tree_eff[tmp.supernova.tree_choosed]):""}</span>
        `
    )

    for (let i = 0; i < TREE_TAB.length; i++) {
        tmp.el["tree_tab"+i+"_btn"].setDisplay(TREE_TAB[i].unl?TREE_TAB[i].unl():true)
        tmp.el["tree_tab"+i+"_notify"].setDisplay(tmp.supernova.tree_afford2[i].length>0)
        tmp.el["tree_tab"+i+"_div"].setDisplay(tmp.tree_tab == i)
        if (tmp.tree_tab == i) for (let x = 0; x < tmp.supernova.tree_had2[i].length; x++) {
            let id = tmp.supernova.tree_had2[i][x]
            let unl = tmp.supernova.tree_unlocked[id]
            tmp.el["treeUpg_"+id].setVisible(unl)
            if (unl) tmp.el["treeUpg_"+id].setClasses({btn_tree: true, qu_tree: TREE_UPGS.ids[id].qf, locked: !tmp.supernova.tree_afford[id], bought: hasTree(id), choosed: id == tmp.supernova.tree_choosed})
        }
    }
}
