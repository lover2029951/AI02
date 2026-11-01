// js/offlineIdleSystem.js  (v29)
// 離線掛機結算
//
// v29 修正（收尾整理）：
//   ⭐ 移除硬寫的 localStorage key，統一讀 HY.SaveSystem.SAVE_KEY
//      —— 原本與 saveSystem 各寫一份 'HUANGYI_WEB_RPG_SAVE_V2'，改一處即不同步
window.HY = window.HY || {};

(function () {
    var MAX_CURRENCY_MULT = 20;
    var MAX_EQUIP_DROPS   = 10;
    var MAX_GUILD_CYCLES  = 40;
    var MAX_EXP_CYCLES    = 20;

    function getSaveKey() {
        if (window.HY && window.HY.SaveSystem && typeof window.HY.SaveSystem.SAVE_KEY === 'string') {
            return window.HY.SaveSystem.SAVE_KEY;
        }
        if (window.HY && typeof window.HY.SAVE_KEY === 'string') {
            return window.HY.SAVE_KEY;
        }
        // 最終回退（理論上不會走到）
        return 'HUANGYI_WEB_RPG_SAVE_V2';
    }

    class OfflineIdleSystem {
        constructor(app) {
            this.app = app;
            this.MAX_OFFLINE_SECONDS = 86400;
            this.MIN_TRIGGER_SECONDS = 60;
            this.lastTickTime = Date.now();

            this.injectTopBarButtonAndModalDOM();
            this.checkOfflineGainsOnLoad();
            this.bindLifecycleTracking();
        }

        injectTopBarButtonAndModalDOM() {
            var sysCtrl = document.querySelector('.system-controls');
            if (sysCtrl && !document.getElementById('btn-offline-pod')) {
                var btn = document.createElement('button');
                btn.id = 'btn-offline-pod';
                btn.className = 'sys-btn';
                btn.style.borderColor = '#10b981';
                btn.style.color = '#34d399';
                btn.style.marginRight = '6px';
                btn.textContent = '🧘 離線掛機艙';

                var self = this;
                btn.addEventListener('click', function () { self.openStatusModal(); });
                sysCtrl.prepend(btn);
            }

            if (!document.getElementById('hy-offline-modal')) {
                var modal = document.createElement('div');
                modal.id = 'hy-offline-modal';
                modal.className = 'hidden';
                modal.style.cssText =
                    'position:fixed; inset:0; background:rgba(0,0,0,0.78); z-index:9999; ' +
                    'display:flex; align-items:center; justify-content:center; padding:16px;';

                modal.innerHTML =
                    '<div style="background:#18202c; border:2px solid #00e5ff; border-radius:8px; max-width:620px; width:100%; padding:18px; box-shadow:0 0 25px rgba(0,229,255,0.3); color:#e2e8f0;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #2e3b4e; padding-bottom:10px; margin-bottom:12px;">' +
                            '<h3 id="offline-modal-title" style="margin:0; color:#00e5ff; font-size:1.1rem;">🛸 馬博士時空艙・離線掛機系統</h3>' +
                            '<button id="btn-close-offline-modal" class="action-btn" style="padding:3px 10px;">✖ 關閉</button>' +
                        '</div>' +
                        '<div id="offline-modal-body" style="font-size:0.88rem; line-height:1.6; max-height:65vh; overflow-y:auto;"></div>' +
                        '<div style="margin-top:14px; text-align:right;">' +
                            '<button id="btn-confirm-offline-modal" class="btn-primary" style="padding:8px 20px;">✅ 收下歷練成果</button>' +
                        '</div>' +
                    '</div>';

                document.body.appendChild(modal);

                var closeFn = function () { modal.classList.add('hidden'); };
                document.getElementById('btn-close-offline-modal').addEventListener('click', closeFn);
                document.getElementById('btn-confirm-offline-modal').addEventListener('click', closeFn);
            }
        }

        getOfflineCombatProfile() {
            var curMap = this.app.timeSys.getCurrentMapData();
            var enemies = (curMap && curMap.enemies) || [];
            var targetEnemy = this.app.combatSys.lastEnemyTemplate || enemies[0] || {
                name: '全息訓練木人', lv: 1, exp: 30, sp: 25, gold: 20
            };
            var partySize = this.app.partySys.getPartySize();
            var mainStats = this.app.charSys.getDerivedStats();

            var avgSpd = mainStats.atkSpd || 105;
            var secondsPerWave = Math.max(3.5, Math.min(10, 850 / avgSpd));

            return {
                mapName: curMap ? curMap.name : '揚州城郊',
                enemy: targetEnemy,
                partySize: partySize,
                secondsPerWave: secondsPerWave
            };
        }

        checkOfflineGainsOnLoad() {
            var root = this.app.charSys.rootState;
            var now = Date.now();
            if (root.lastOnlineTimestamp) {
                var elapsedSec = Math.floor((now - root.lastOnlineTimestamp) / 1000);
                if (elapsedSec >= this.MIN_TRIGGER_SECONDS) {
                    this.processOfflineRewards(elapsedSec, '離線閉關歷練');
                }
            }
            root.lastOnlineTimestamp = now;
            this.lastTickTime = now;
        }

        bindLifecycleTracking() {
            var self = this;

            var origSave = this.app.saveSys.save.bind(this.app.saveSys);
            this.app.saveSys.save = function (silent) {
                self.app.charSys.rootState.lastOnlineTimestamp = Date.now();
                origSave(silent);
            };

            setInterval(function () {
                var now = Date.now();
                var deltaSec = Math.floor((now - self.lastTickTime) / 1000);
                self.lastTickTime = now;

                if (deltaSec >= self.MIN_TRIGGER_SECONDS) {
                    self.processOfflineRewards(deltaSec, '背景分頁掛機補償');
                }

                self.app.charSys.rootState.lastOnlineTimestamp = now;
                try {
                    // ⭐ v29：統一讀取 saveKey
                    localStorage.setItem(getSaveKey(), JSON.stringify(self.app.charSys.rootState));
                } catch (e) {}
            }, 10000);

            window.addEventListener('beforeunload', function () {
                self.app.charSys.rootState.lastOnlineTimestamp = Date.now();
                try {
                    localStorage.setItem(getSaveKey(), JSON.stringify(self.app.charSys.rootState));
                } catch (e) {}
            });
        }

        processOfflineRewards(rawSeconds, sourceTitle) {
            var sec = Math.min(this.MAX_OFFLINE_SECONDS, Math.max(0, Math.floor(rawSeconds)));
            if (sec < this.MIN_TRIGGER_SECONDS) return;

            var profile = this.getOfflineCombatProfile();
            var enemy = profile.enemy;
            var pSize = profile.partySize;
            var waves = Math.max(1, Math.floor(sec / profile.secondsPerWave));
            var totalKills = waves * pSize;

            var rawExp  = (enemy.exp || 30) * totalKills;
            var rawSp   = (enemy.sp || 20) * totalKills;
            var rawGold = (enemy.gold || 20) * totalKills;

            var finalExp  = Math.max(1, Math.floor(rawExp / 5));
            var finalSp   = Math.max(1, Math.floor(rawSp / 10));
            var finalGold = Math.max(1, Math.floor(rawGold / 10));

            this.app.charSys.gainRewards(finalExp, finalSp, finalGold);

            var poeSys = this.app.poeSys;
            var droppedEquips = [];
            var droppedOrbs = {};
            var equipAddedCount = 0;

            if (poeSys) {
                var sampleKills = Math.min(150, Math.max(1, totalKills));
                var multFactor = Math.max(1, Math.min(MAX_CURRENCY_MULT, Math.floor(totalKills / sampleKills)));

                for (var i = 0; i < sampleKills; i++) {
                    var isMagicOrRare = (Math.random() * 100 < 35);
                    var mockEnemy = {
                        lv: enemy.lv || 1,
                        rarity: isMagicOrRare ? (Math.random() < 0.5 ? 'rare' : 'magic') : 'normal',
                        lootMult: isMagicOrRare ? 1.5 : 1.0
                    };

                    if (equipAddedCount < MAX_EQUIP_DROPS) {
                        var eq = poeSys.rollEquipmentDropByEnemy(mockEnemy);
                        if (eq) {
                            equipAddedCount += 1;
                            droppedEquips.push((eq.rareTitle || '') + eq.name);
                        }
                    }

                    var orb = poeSys.rollCurrencyDropByEnemy(mockEnemy);
                    if (orb) {
                        droppedOrbs[orb.name] = (droppedOrbs[orb.name] || 0) + multFactor;
                        if (multFactor > 1) {
                            poeSys.addCurrency(orb.id, multFactor - 1);
                        }
                    }
                }
            }

            var guildCycles = Math.min(MAX_GUILD_CYCLES, Math.floor(sec / 15));
            if (this.app.guildBuilding && guildCycles > 0) {
                for (var gIdx = 0; gIdx < guildCycles; gIdx++) {
                    this.app.guildBuilding.harvestAllBuildings(false);
                }
            }

            var expCycles = Math.min(MAX_EXP_CYCLES, Math.floor(sec / 180));
            if (this.app.salvageExpSys && expCycles > 0) {
                var activePets = this.app.salvageExpSys.getExpeditionPetList();
                if (activePets.length > 0) {
                    for (var pIdx = 0; pIdx < expCycles; pIdx++) {
                        this.app.salvageExpSys.completeExpeditionCycle(activePets);
                    }
                }
            }

            this.app.renderAll();

            this.showOfflineReportModal({
                title: '🛸 馬博士時空艙・' + sourceTitle + '報告',
                sec: sec,
                mapName: profile.mapName,
                enemyName: enemy.name,
                waves: waves,
                totalKills: totalKills,
                exp: finalExp,
                sp: finalSp,
                gold: finalGold,
                equips: droppedEquips,
                equipCount: equipAddedCount,
                orbs: droppedOrbs,
                guildCycles: guildCycles,
                expCycles: expCycles
            });
        }

        formatDuration(sec) {
            var h = Math.floor(sec / 3600);
            var m = Math.floor((sec % 3600) / 60);
            var s = sec % 60;
            var parts = [];
            if (h > 0) parts.push(h + ' 小時');
            if (m > 0) parts.push(m + ' 分');
            parts.push(s + ' 秒');
            return parts.join(' ');
        }

        showOfflineReportModal(report) {
            var modal = document.getElementById('hy-offline-modal');
            var titleEl = document.getElementById('offline-modal-title');
            var bodyEl = document.getElementById('offline-modal-body');
            if (!modal || !bodyEl) return;

            titleEl.textContent = report.title;

            var orbStr = Object.keys(report.orbs).map(function (k) {
                return '💎 ' + k + ' x' + report.orbs[k];
            }).join('、') || '無';

            var eqStr = report.equips.length > 0
                ? '🗡️ 獲得 ' + report.equipCount + ' 件裝備（' + report.equips.slice(0, 6).join('、') + (report.equips.length > 6 ? '...' : '') + '）'
                : '無';

            bodyEl.innerHTML =
                '<div style="background:#121822; padding:12px; border-radius:6px; border-left:4px solid #00e5ff; margin-bottom:10px;">' +
                    '<div>⏱️ <strong>離線歷練時長</strong>：<span style="color:#00e5ff;">' + this.formatDuration(report.sec) + '</span> (最高累積 24 小時)</div>' +
                    '<div>📍 <strong>駐守歷練時空</strong>：' + report.mapName + ' — 迎戰【' + report.enemyName + '】</div>' +
                    '<div>⚔️ <strong>離線殲敵統計</strong>：共交鋒 <strong>' + report.waves + '</strong> 波，殲滅 <strong>' + report.totalKills + '</strong> 名敵人</div>' +
                '</div>' +
                '<div style="background:#121822; padding:12px; border-radius:6px; border-left:4px solid #fbbf24; margin-bottom:10px;">' +
                    '<h4 style="margin:0 0 6px 0; color:#fbbf24;">💰 戰鬥修為與財富收益</h4>' +
                    '<div>🎉 上陣隊員各獲經驗：<strong style="color:#4ade80;">+' + report.exp.toLocaleString() + '</strong></div>' +
                    '<div>📖 獲得武學點數：<strong class="sp-color">+' + report.sp.toLocaleString() + '</strong></div>' +
                    '<div>🪙 獲得大唐紋銀：<strong class="gold-color">+' + report.gold.toLocaleString() + ' 兩</strong></div>' +
                '</div>' +
                '<div style="background:#121822; padding:12px; border-radius:6px; border-left:4px solid #10b981;">' +
                    '<h4 style="margin:0 0 6px 0; color:#10b981;">🎁 離線打寶、幫會生產與靈獸探險</h4>' +
                    '<div>🗡️ 離線裝備掉落：' + eqStr + '</div>' +
                    '<div>💎 離線通貨掉落：' + orbStr + '</div>' +
                    '<div>🏯 幫會建築自動徵收：已完成 <strong>' + report.guildCycles + '</strong> 輪生產結算</div>' +
                    '<div>🐉 靈獸時空探險隊：已完成 <strong>' + report.expCycles + '</strong> 次探險收集</div>' +
                '</div>';

            modal.classList.remove('hidden');
        }

        openStatusModal() {
            var modal = document.getElementById('hy-offline-modal');
            var titleEl = document.getElementById('offline-modal-title');
            var bodyEl = document.getElementById('offline-modal-body');
            if (!modal || !bodyEl) return;

            var profile = this.getOfflineCombatProfile();
            var enemy = profile.enemy;
            var wavesPerHour = Math.floor(3600 / profile.secondsPerWave);
            var killsPerHour = wavesPerHour * profile.partySize;

            var expPerHour  = Math.max(1, Math.floor((enemy.exp * killsPerHour) / 5));
            var spPerHour   = Math.max(1, Math.floor(((enemy.sp * killsPerHour) / 10) * this.app.charSys.rewardRate));
            var goldPerHour = Math.max(1, Math.floor(((enemy.gold * killsPerHour) / 10) * this.app.charSys.rewardRate));

            titleEl.textContent = '🧘 隨身時空艙・離線掛機效率總覽';
            bodyEl.innerHTML =
                '<p style="color:#94a3b8; margin-bottom:10px;">💡 關閉網頁、重整或切到背景超過 <strong>60 秒</strong> 時，系統會依當前時空地圖、上陣人數與出手攻速結算離線收益（單次最高 24 小時）。</p>' +
                '<div style="background:#121822; padding:12px; border-radius:6px; border:1px solid #2e3b4e; margin-bottom:10px;">' +
                    '<h4 style="color:#00e5ff; margin-bottom:6px;">📊 當前配置【每小時】預計收益</h4>' +
                    '<div>📍 當前掛機地圖：<strong>' + profile.mapName + ' (目標：' + enemy.name + ')</strong></div>' +
                    '<div>🚩 上陣隊伍人數：<strong>' + profile.partySize + ' 人</strong></div>' +
                    '<div>⚡ 平均交鋒速度：約 <strong>' + profile.secondsPerWave.toFixed(1) + ' 秒 / 波</strong></div>' +
                    '<hr style="border:none; border-top:1px dashed #334155; margin:8px 0;">' +
                    '<div>⚔️ 每小時預計殲敵：<strong>' + killsPerHour.toLocaleString() + ' 隻</strong></div>' +
                    '<div>🎉 每小時預計經驗：<strong style="color:#4ade80;">+' + expPerHour.toLocaleString() + ' / 人</strong></div>' +
                    '<div>📖 每小時預計武點：<strong class="sp-color">+' + spPerHour.toLocaleString() + '</strong></div>' +
                    '<div>🪙 每小時預計紋銀：<strong class="gold-color">+' + goldPerHour.toLocaleString() + ' 兩</strong></div>' +
                '</div>';

            modal.classList.remove('hidden');
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            var game = window.HY.game;
            if (game) {
                window.HY.offlineSys = new OfflineIdleSystem(game);
            }
        }, 150);
    });

    window.HY.OfflineIdleSystem = OfflineIdleSystem;
})();