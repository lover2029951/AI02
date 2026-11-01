// js/loadOrder.js (v71)
// ⭐ v71：名人深造與社交（2 支新檔）—— 讓虛擬人物比照玩家角色 + 讓世界有活力
//   + townCelebAdvance.js（等級／四維／修行／切磋／指點／論道／入公會／日常／同門相聚／公告板）
//     必須在 townCelebSystem.js 之後
//   + uiTownCelebAdvance.js（名人視窗新增「📊 名人檔案／🤝 互動／🌍 世界動態」）
//     必須在 uiTownCeleb.js 與 uiTownOverlays.js 之後、main.js 之前
// ⭐ v70：小鎮彈出視窗化（uiTownOverlays.js）
// ⭐ v69：名人遊歷小鎮（townCelebSystem.js / uiTownCeleb.js）
// ⭐ v68：冒險者深造（townGuildAdvance.js / uiTownGuildAdvance.js）
// ⭐ v67：冒險者公會（townGuildSystem.js / uiTownGuild.js）
// ⭐ v66：我的小鎮 v2.2（townExtra.js）
// ⭐ v65：我的小鎮 v2（虛擬人物定居）
// ⭐ v64：接入「我的小鎮」（3 支新檔）
// ⭐ v62：接入大樂透（3 支新檔）
// ⭐ v61：gameConfig 拆分為 5 支子檔
window.HY_LOAD_CONFIG = {
  version: '71',
  basePath: './js/',
  abortOnMissing: true,

  files: [
    // ⭐ gameConfig 5 支（必須連續排在最前）
    'gameConfig.js',
    'gameConfigSpeed.js',
    'gameConfigApply.js',
    'gameConfigApply2.js',
    'gameConfigBoot.js',

    // ── 資料層 ──
    'uiConfigData.js',
    'elementData.js',
    'formationData.js',
    'mapData.js',
    'sectData.js',
    'externalArtsData.js',
    'xinfaData.js',
    'qinggongData.js',
    'masteryData.js',
    'meridianData.js',
    'spiritRootData.js',
    'equipmentData.js',
    'companionData.js',
    'petData.js',
    'partyData.js',
    'affixData.js',
    'poeCraftData.js',
    'guildData.js',
    'townData.js',
    'lotteryCelebData.js',
    'lotteryCelebData2.js',
    'lotteryCelebData3.js',

    // ── 核心系統層 ──
    'saveSystem.js',
    'characterSystem.js',
    'rosterSystem.js',
    'partySystem.js',
    'martialSystem.js',
    'inventorySystem.js',
    'equipmentSystem.js',
    'poeCraftSystem.js',
    'blackMarketSystem.js',
    'petSystem.js',
    'companionSystem.js',
    'affixSystem.js',
    'guildCoreSystem.js',
    'guildBuildingSystem.js',
    'guildSkillBeastSystem.js',
    'guildRealmEventSystem.js',
    'sectFeatureSystem.js',
    // ⭐ 我的小鎮核心（順序不可調換）
    'townSystem.js',
    'townExtra.js',
    'townGuildSystem.js',
    'townGuildAdvance.js',
    'townCelebSystem.js',
    'townCelebAdvance.js',

    // ── 戰鬥 ──
    'combatAutoTactics.js',
    'combatPlayerTurn.js',
    'combatEnemyTurn.js',
    'combatCore.js',
    'timeTravelSystem.js',

    // ── UI 層（順序不可調換）──
    'uiCharacterParty.js',
    'uiCombatExplore.js',
    'uiMartialSect.js',
    'uiEquipMarket.js',
    'uiCompanionPet.js',
    'uiLogPanels.js',
    'uiGuild.js',
    'uiTown.js',
    'uiTownGuild.js',
    'uiTownGuildAdvance.js',
    'uiTownCeleb.js',
    // ⭐ 名人深造 UI（需在 uiTownCeleb.js 之後）
    'uiTownCelebAdvance.js',
    // ⭐ 彈出視窗化（必須最後，才能攔截上面幾支的 switchTab）
    'uiTownOverlays.js',
    'main.js',

    // ── 後置系統 ──
    'dexteritySpeedSystem.js',
    'combatAtbSystem.js',
    'uiDexAtb.js',
    'spiritRootSystem.js',
    'uiSpiritRoot.js',
    'enemyFormationSystem.js',
    'salvageExpeditionSystem.js',
    'uiSalvageExpedition.js',
    'uiInventorySorter.js',
    'offlineIdleSystem.js',
    'levelExpSystem.js',
    'elementSystem.js',
    'responsiveLayoutSystem.js',
    'cheatPanel.js',
    'gambleSystem.js',
    'lotterySystem.js',
    'uiLottery.js'
  ],

  globals: {
    'gameConfig.js': 'HY.GameConfig',
    'gameConfigSpeed.js': 'HY.GameConfig.__speedLoaded',
    'gameConfigApply.js': 'HY.GameConfig.__applyLoaded',
    'gameConfigApply2.js': 'HY.GameConfig.__apply2Loaded',
    'gameConfigBoot.js': 'HY.GameConfig.__bootLoaded',

    'uiConfigData.js': 'HY.Data.CONFIG',
    'elementData.js': 'HY.Data.ELEMENTS',
    'formationData.js': 'HY.Data.XIANXIA_FORMATIONS',
    'mapData.js': 'HY.Data.MAPS',
    'sectData.js': 'HY.Data.SECTS',
    'externalArtsData.js': 'HY.Data.MARTIAL_ARTS',
    'xinfaData.js': 'HY.Data.XINFA',
    'qinggongData.js': 'HY.Data.QINGGONG',
    'masteryData.js': 'HY.Data.MASTERY',
    'meridianData.js': 'HY.Data.MERIDIANS',
    'spiritRootData.js': 'HY.Data.SPIRIT_ROOTS',
    'equipmentData.js': 'HY.Data.ITEMS',
    'companionData.js': 'HY.Data.COMPANIONS',
    'petData.js': 'HY.Data.PETS',
    'partyData.js': 'HY.Data.PRESET_NAMES',
    'affixData.js': 'HY.Data.MONSTER_AFFIXES',
    'poeCraftData.js': 'HY.Data.CURRENCIES',
    'guildData.js': 'HY.Data.GUILD_BUILDINGS',
    'townData.js': 'HY.Data.TOWN',
    'lotteryCelebData.js': 'HY.Data.LOTTERY_CELEBS',
    'lotteryCelebData2.js': 'HY.Data.LOTTERY_CELEBS_V2',
    'lotteryCelebData3.js': 'HY.Data.LOTTERY_CELEBS_V3',

    'saveSystem.js': 'HY.SaveSystem',
    'characterSystem.js': 'HY.CharacterSystem',
    'rosterSystem.js': 'HY.RosterSystem',
    'partySystem.js': 'HY.PartySystem',
    'martialSystem.js': 'HY.MartialSystem',
    'inventorySystem.js': 'HY.InventorySystem',
    'equipmentSystem.js': 'HY.EquipmentSystem',
    'poeCraftSystem.js': 'HY.PoeCraftSystem',
    'blackMarketSystem.js': 'HY.BlackMarketSystem',
    'petSystem.js': 'HY.PetSystem',
    'companionSystem.js': 'HY.CompanionSystem',
    'affixSystem.js': 'HY.AffixSystem',
    'guildCoreSystem.js': 'HY.GuildCoreSystem',
    'guildBuildingSystem.js': 'HY.GuildBuildingSystem',
    'guildSkillBeastSystem.js': 'HY.GuildSkillBeastSystem',
    'guildRealmEventSystem.js': 'HY.GuildRealmEventSystem',
    'sectFeatureSystem.js': 'HY.SectFeatureSystem',
    'townSystem.js': 'HY.TownSystem',
    'townExtra.js': 'HY.TownExtra',
    'townGuildSystem.js': 'HY.TownGuild',
    'townGuildAdvance.js': 'HY.TownGuildAdv',
    'townCelebSystem.js': 'HY.TownCeleb',
    'townCelebAdvance.js': 'HY.TownCelebAdv',

    'combatAutoTactics.js': 'HY.CombatAutoTactics',
    'combatPlayerTurn.js': 'HY.CombatPlayerTurn',
    'combatEnemyTurn.js': 'HY.CombatEnemyTurn',
    'combatCore.js': 'HY.CombatCore',
    'timeTravelSystem.js': 'HY.TimeTravelSystem',

    'uiCharacterParty.js': 'HY.UICharacterParty',
    'uiCombatExplore.js': 'HY.UICombatExplore',
    'uiMartialSect.js': 'HY.UIMartialSect',
    'uiEquipMarket.js': 'HY.UIEquipMarket',
    'uiCompanionPet.js': 'HY.UICompanionPet',
    'uiLogPanels.js': 'HY.UILogPanels',
    'uiGuild.js': 'HY.UIGuild',
    'uiTown.js': 'HY.UITown',
    'uiTownGuild.js': 'HY.UITownGuild',
    'uiTownGuildAdvance.js': 'HY.UITownGuildAdv',
    'uiTownCeleb.js': 'HY.UITownCeleb',
    'uiTownCelebAdvance.js': 'HY.UITownCelebAdv',
    'uiTownOverlays.js': 'HY.UITownOverlays',

    'dexteritySpeedSystem.js': 'HY.DexteritySpeedSystem',
    'combatAtbSystem.js': 'HY.CombatAtbSystem',
    'uiDexAtb.js': 'HY.UIDexAtb',
    'spiritRootSystem.js': 'HY.SpiritRootSystem',
    'uiSpiritRoot.js': 'HY.UISpiritRoot',
    'enemyFormationSystem.js': 'HY.EnemyFormationSystem',
    'salvageExpeditionSystem.js': 'HY.SalvageExpeditionSystem',
    'uiSalvageExpedition.js': 'HY.UISalvageExpedition',
    'uiInventorySorter.js': 'HY.UIInventorySorter',
    'offlineIdleSystem.js': 'HY.OfflineIdleSystem',
    'levelExpSystem.js': 'HY.LevelExpSystem',
    'elementSystem.js': 'HY.ElementSystem',
    'responsiveLayoutSystem.js': 'HY.ResponsiveLayoutSystem',
    'cheatPanel.js': 'HY.CheatPanel',
    'gambleSystem.js': 'HY.GambleSystem',
    'lotterySystem.js': 'HY.LotterySystem',
    'uiLottery.js': 'HY.UILottery'
  }
};