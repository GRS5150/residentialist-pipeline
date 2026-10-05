# Post-sweep cleanup report
Generated 2026-10-05 14:25 UTC

Sweep gate: phase=refresh metros_not_yet_reswept=0

## 1. Source
  copied live DB read-only -> /home/ubuntu/cleanup/work/spec-crawler.copy.json
  36,289 listings, 423,523 specs, 2,719 builders

## 2. Deduplication
  listings 36,289 -> 29,638   (6,651 duplicate rows removed)
  6,651 listing ids repointed to the surviving row
  specs    423,523 -> 289,132   (134,391 duplicate rows removed)

## 3. Brand normalization
  clean_windows.py:     67 window aliases, 44 exclusions
  appliance_aliases.py: 38 appliance aliases
  generated 400 canonical groups for the other categories
  merged 102 variants under the one-typo rule (Ray, Sept 8): differ only by
     spacing, punctuation, casing or a single character edit on a name of 6+ chars
  flagged 0 pairs left for your review, could be two different companies
  merged under the one-typo rule:
     Cabinets          California Closet -> California Closets   [one-typo rule]
     Cabinets          Kitchen Kraft -> KitchenCraft   [one-typo rule]
     Cabinets          Kitchen Craft -> KitchenCraft   [one-typo rule]
     Cabinets          Cucine Ricci -> Cucina Ricci   [one-typo rule]
     Countertops       TAJ MAHAL -> Taj Mahal   [one-typo rule]
     Countertops       Taj Majal -> Taj Mahal   [one-typo rule]
     Countertops       Tahj Mahal -> Taj Mahal   [one-typo rule]
     Countertops       Crystallo -> Cristallo   [one-typo rule]
     Countertops       Cristalo -> Cristallo   [one-typo rule]
     Countertops       Cristello -> Cristallo   [one-typo rule]
     Countertops       Monte Blanc -> Mont Blanc   [one-typo rule]
     Countertops       Pompei -> Pompeii   [one-typo rule]
     Countertops       Consentino -> Cosentino   [one-typo rule]
     Countertops       Costentino -> Cosentino   [one-typo rule]
     Countertops       Carrera -> Carrara   [one-typo rule]
     Doors             Anderson -> Andersen   [one-typo rule]
     Doors             ANDERSON -> Andersen   [one-typo rule]
     Doors             Nanawall -> NanaWall   [one-typo rule]
     Doors             Nana Wall -> NanaWall   [one-typo rule]
     Doors             Nanowall -> NanaWall   [one-typo rule]
     Doors             Jeld Wen -> Jeld-Wen   [one-typo rule]
     Doors             Jeldwen -> Jeld-Wen   [one-typo rule]
     Doors             JELD-WEN -> Jeld-Wen   [one-typo rule]
     Doors             Jeldwyn -> Jeld-Wen   [one-typo rule]
     Doors             Therma Tru -> Therma-Tru   [one-typo rule]
     Doors             Thermatru -> Therma-Tru   [one-typo rule]
     Doors             Therma-True -> Therma-Tru   [one-typo rule]
     Doors             THERMO-TRU -> Therma-Tru   [one-typo rule]
     Doors             Cantara -> Cantera   [one-typo rule]
     Doors             Windor -> Windsor   [one-typo rule]
     Doors             WinDor -> Windsor   [one-typo rule]
     Doors             Millard -> Milgard   [one-typo rule]
     Flooring          Duchateau -> DuChateau   [one-typo rule]
     Flooring          Du Chateau -> DuChateau   [one-typo rule]
     Flooring          DU CHATEAU -> DuChateau   [one-typo rule]
     Flooring          DuChteau -> DuChateau   [one-typo rule]
     Flooring          Dechateau -> DuChateau   [one-typo rule]
     Flooring          Coretec -> COREtec   [one-typo rule]
     Flooring          Core Tech -> COREtec   [one-typo rule]
     Flooring          Provanza -> Provenza   [one-typo rule]
     Flooring          Pebble-Tec -> Pebble Tec   [one-typo rule]
     Flooring          Pebble Tech -> Pebble Tec   [one-typo rule]
     Flooring          Belgrad -> Belgrade   [one-typo rule]
     Generators        GENERAC -> Generac   [one-typo rule]
     Generators        Generace -> Generac   [one-typo rule]
     Generators        KOHLER -> Kohler   [one-typo rule]
     Generators        Koehler -> Kohler   [one-typo rule]
     Generators        DuroMax -> Duramax   [one-typo rule]
     HVAC              DAIKON -> Daikin   [one-typo rule]
     HVAC              Daikon -> Daikin   [one-typo rule]
     HVAC              REME HALO -> Reme Halo   [one-typo rule]
     HVAC              REME Halo -> Reme Halo   [one-typo rule]
     HVAC              Rem-Halo -> Reme Halo   [one-typo rule]
     HVAC              Remi-halo -> Reme Halo   [one-typo rule]
     HVAC              Infratec -> Infratech   [one-typo rule]
     HVAC              Buderas -> Buderus   [one-typo rule]
     Lighting          Bevelo -> Bevolo   [one-typo rule]
     Lighting          Anteriors -> Arteriors   [one-typo rule]
     Lighting          Phillips -> Philips   [one-typo rule]
     Lighting          Currey & Co. -> Currey & Company   [one-typo rule]
     Lighting          Currey and Co. -> Currey & Company   [one-typo rule]
     Lighting          Currey & Co -> Currey & Company   [one-typo rule]
     Lighting          Curry & Co -> Currey & Company   [one-typo rule]
     Lighting          Curry & Company -> Currey & Company   [one-typo rule]
     Lighting          John-Richard -> John Richard   [one-typo rule]
     Lighting          John Richards -> John Richard   [one-typo rule]
     Lighting          Regina Andrews -> Regina Andrew   [one-typo rule]
     Plumbing          KOHLER -> Kohler   [one-typo rule]
     Plumbing          Koehler -> Kohler   [one-typo rule]
     Plumbing          KALLISTA -> Kallista   [one-typo rule]
     Plumbing          Kalista -> Kallista   [one-typo rule]
     Plumbing          Dorn Bracht -> Dornbracht   [one-typo rule]
     Plumbing          Dornbract -> Dornbracht   [one-typo rule]
     Plumbing          Phyllrich -> Phylrich   [one-typo rule]
     Plumbing          NAVIEN -> Navien   [one-typo rule]
     Plumbing          Navian -> Navien   [one-typo rule]
     Smart Home        Creston -> Crestron   [one-typo rule]
     Smart Home        VIVINT -> Vivint   [one-typo rule]
     Smart Home        Vivant -> Vivint   [one-typo rule]
     Smart Home        Ubiquity -> Ubiquiti   [one-typo rule]
     Smart Home        Simplisafe -> SimpliSafe   [one-typo rule]
     Smart Home        Simply Safe -> SimpliSafe   [one-typo rule]
     Smart Home        SimplySafe -> SimpliSafe   [one-typo rule]
     Smart Home        Qolsys -> Quolsys   [one-typo rule]
     Smart Home        Aqualink -> iAquaLink   [one-typo rule]
     Smart Home        AquaLink -> iAquaLink   [one-typo rule]
     Smart Home        Aqua Link -> iAquaLink   [one-typo rule]
     Smart Home        iAqualink -> iAquaLink   [one-typo rule]
     Water Treatment   KINETICO -> Kinetico   [one-typo rule]
     Water Treatment   Kinetic -> Kinetico   [one-typo rule]
     Water Treatment   Kenetico -> Kinetico   [one-typo rule]
     Water Treatment   CULLIGAN -> Culligan   [one-typo rule]
     Water Treatment   Mulligan -> Culligan   [one-typo rule]
     Water Treatment   Aquasauna -> Aquasana   [one-typo rule]
     Water Treatment   Aqua Sauna -> Aquasana   [one-typo rule]
     Water Treatment   FlowLogic -> FloLogic   [one-typo rule]
     Water Treatment   AquaSure -> Aqua Pure   [one-typo rule]
     Water Treatment   Aquasure -> Aqua Pure   [one-typo rule]
     Water Treatment   Flow-Tech -> Flow Tech   [one-typo rule]
     Water Treatment   Flo-Tech -> Flow Tech   [one-typo rule]
     Water Treatment   Flowtec -> Flow Tech   [one-typo rule]
     Water Treatment   Water Doctor -> Water Doctors   [one-typo rule]
  locked as distinct names, never matched: aquatic, aquatica, bellmont, belmont, windoor
  canonical names come from the authority list; frequency is fallback only
  rows rewritten by category:
     Appliances                  2,918
     Smart Home                    309
     Windows                       240
     Pool                          212
     Outdoor                       128
     Plumbing                      100
     Doors                          99
     Cabinets                       81
     Lighting                       50
     Water Treatment                48
     Other                          47
     Wine Storage                   46
     HVAC                           45
     Countertops                    43
     Flooring                       37
     Paint                          34
     Siding                         29
     Closets                        22
     Generators                     21
     Hardware                       14
     Sinks                          12
     Solar                          12
     Roofing                        11
     LVP                            10
     Garage Doors                    9
     Fireplaces                      6
     Tile                            5
     Gutters                         5
     Insulation                      4
     Furniture                       4
     Carpet                          4
     Sauna                           3
     Water Heaters                   2
     Elevators                       1

## 4. Recategorization
  Windows -> Window Treatments : 417 rows
  Windows -> Smart Home        : 1 rows
  HVAC    -> Smart Home        : 440 rows (thermostats)
  Windows dropped as non-brand : 15 rows (ES 3, MI 3, Quartz 1, Solatube 1, Lifetime 1, Brown 1, Quality 1, Techno Glass 1)

## 5. Index regeneration, one count per home
  distinct homes: 29,074   with named specs: 24,868
  market-context-index.json: 5,889 brand x category combos
  co-occurrence-index.json: 298 pairs at >=20 homes, 268 brands at >=15

## 6. Texas sweep verification

  Houston, TX: 815 sold in the six-month window
     2026-03:   15 ###
     2026-04:   28 #####
     2026-05:  181 ####################################
     2026-06:  187 #####################################
     2026-07:  161 ################################
     2026-08:  119 #######################
     2026-09:  118 #######################
     2026-10:    6 #
     Apr-Jul: ALL FOUR PRESENT

  Dallas, TX: 657 sold in the six-month window
     2026-03:   72 ##############
     2026-04:  116 #######################
     2026-05:   91 ##################
     2026-06:  113 ######################
     2026-07:  107 #####################
     2026-08:   82 ################
     2026-09:   70 ##############
     2026-10:    6 #
     Apr-Jul: ALL FOUR PRESENT

  Austin, TX: 1,168 sold in the six-month window
     2026-03:  109 #####################
     2026-04:  175 ###################################
     2026-05:  202 ########################################
     2026-06:  194 ######################################
     2026-07:  188 #####################################
     2026-08:  151 ##############################
     2026-09:  144 ############################
     2026-10:    5 #
     Apr-Jul: ALL FOUR PRESENT

## 7. Top ten before and after

### Appliances
  brand                         before rows  after homes
  Sub-Zero                            4,134        5,962
  Wolf                                5,845        5,698
  Thermador                           3,869        3,705
  Bosch                               2,153        2,148
  Viking                              1,498        1,447
  Miele                               1,435        1,411
  KitchenAid                          1,340        1,328
  Monogram                              476          856
  JennAir                               462          683
  GE                                    546          521
  before, raw top ten: Wolf (5,845), Sub-Zero (4,134), Thermador (3,869), Bosch (2,153), Viking (1,498), Miele (1,435), KitchenAid (1,340), Subzero (751), Sub Zero (617), GE (546)

### Windows
  brand                         before rows  after homes
  Andersen                              294          462
  Pella                                 454          452
  Marvin                                231          232
  PGT                                   124          127
  Fleetwood                              72           72
  Sierra Pacific                         50           50
  Milgard                                47           50
  Jeld-Wen                               17           27
  Kolbe                                  21           23
  Lincoln                                17           17
  before, raw top ten: Pella (454), Andersen (294), Hunter Douglas (291), Marvin (231), Anderson (170), PGT (124), Fleetwood (72), Sierra Pacific (50), Milgard (47), Phantom (25)

## Totals
  listings 36,289 -> 29,638
  specs    423,523 -> 289,117
  homes with named specs: 24,868
