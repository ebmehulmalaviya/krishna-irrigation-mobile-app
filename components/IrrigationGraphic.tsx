import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface IrrigationGraphicProps {
  type:
    | 'union-valve'
    | 'upvc-valve'
    | 'solid-valve'
    | 'cat-valves'
    | 'cat-jhatka'
    | 'cat-drip'
    | 'cat-mini-sprinkler'
    | 'cat-sprinkler'
    | 'cat-rainpipe'
    | 'drip-fittings'
    | 'sprinkler-fittings'
    | 'mini-sprinkler'
    | 'rain-pipe'
    | 'jhatka-fittings';
  width?: number;
  height?: number;
}

export const IrrigationGraphic: React.FC<IrrigationGraphicProps> = ({
  type,
  width = 80,
  height = 80,
}) => {
  switch (type) {
    // -------------------------------------------------------------------------
    // 1. UNION VALVE (Screenshot 2: 1 P and 1 T)
    // Black body + bright lime-green handle + side threaded collars
    // -------------------------------------------------------------------------
    case 'union-valve':
      return (
        <View style={[styles.container, { width, height }]}>
          {/* Top Green Handle */}
          <View style={styles.greenHandleWrapper}>
            <View style={styles.greenHandleGrip} />
            <View style={styles.handleHubGreen} />
            <View style={styles.greenHandleGrip} />
          </View>
          <View style={styles.blackStem} />

          {/* Black Union Valve Body */}
          <View style={styles.unionBody}>
            {/* Left Threaded Collar */}
            <View style={styles.unionCollar}>
              <View style={styles.rib} />
              <View style={styles.rib} />
              <View style={styles.rib} />
            </View>
            {/* Center Ball Chamber */}
            <View style={styles.unionSphere}>
              <View style={styles.sphereHighlight} />
            </View>
            {/* Right Threaded Collar */}
            <View style={styles.unionCollar}>
              <View style={styles.rib} />
              <View style={styles.rib} />
              <View style={styles.rib} />
            </View>
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 2. UPVC VALVE (Screenshot 2: 2A)
    // Pure white socket body + royal blue handle
    // -------------------------------------------------------------------------
    case 'upvc-valve':
      return (
        <View style={[styles.container, { width, height }]}>
          {/* Top Blue Handle */}
          <View style={styles.blueHandleWrapper}>
            <View style={styles.blueHandleGrip} />
            <View style={styles.handleHubBlue} />
            <View style={styles.blueHandleTail} />
          </View>
          <View style={styles.whiteStem} />

          {/* White UPVC Valve Body */}
          <View style={styles.upvcBody}>
            <View style={styles.upvcSocketLeft} />
            <View style={styles.upvcCenterSphere}>
              <View style={styles.upvcInnerGleam} />
            </View>
            <View style={styles.upvcSocketRight} />
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 3. SOLID VALVE (Screenshot 2: 3 P)
    // Off-white / grey body + long metal handle (M.S. Patti)
    // -------------------------------------------------------------------------
    case 'solid-valve':
      return (
        <View style={[styles.container, { width, height }]}>
          {/* Long Metal Patti Handle */}
          <View style={styles.metalHandleWrapper}>
            <View style={styles.metalHandleBar} />
            <View style={styles.metalHandleGripBlue} />
          </View>
          <View style={styles.metalStem} />

          {/* Solid Heavy Body */}
          <View style={styles.solidBody}>
            <View style={styles.solidCollarLeft} />
            <View style={styles.solidCenterGlobe}>
              <View style={styles.solidCenterRidge} />
            </View>
            <View style={styles.solidCollarRight} />
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 4. CATEGORY: એગ્રીકલ્ચર વાલ્વ (Screenshot 1: Card 1)
    // Cluster of black valves with blue/green handles
    // -------------------------------------------------------------------------
    case 'cat-valves':
      return (
        <View style={[styles.clusterContainer, { width, height }]}>
          <View style={styles.valvesClusterRow}>
            {/* Small black ball valve */}
            <View style={styles.miniValveBox}>
              <View style={styles.miniHandleBlack} />
              <View style={styles.miniBodyBlack} />
            </View>

            {/* Main Union Valve */}
            <View style={styles.miniValveCenter}>
              <View style={styles.miniHandleGreen} />
              <View style={styles.miniUnionBody} />
            </View>

            {/* Blue Handle Valve */}
            <View style={styles.miniValveBox}>
              <View style={styles.miniHandleBlue} />
              <View style={styles.miniBodyBlue} />
            </View>

            {/* Foot valve / strainer */}
            <View style={styles.miniFootValve}>
              <View style={styles.footStrainerTop} />
              <View style={styles.footStrainerMesh} />
            </View>
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 5. CATEGORY: એગ્રીકલ્ચર અને ઝટકા ફિટિંગ્સ (Screenshot 1: Card 2)
    // Saddle clamp, pipe joiner, and flange ring
    // -------------------------------------------------------------------------
    case 'cat-jhatka':
    case 'jhatka-fittings':
      return (
        <View style={[styles.clusterContainer, { width, height }]}>
          <View style={styles.jhatkaCluster}>
            {/* Saddle clamp */}
            <View style={styles.saddleClampArc}>
              <View style={styles.saddleHole} />
            </View>
            {/* White pipe joiner */}
            <View style={styles.whitePipeJoiner}>
              <View style={styles.joinerBand} />
            </View>
            {/* Metal Flange Ring */}
            <View style={styles.flangeRingRound}>
              <View style={styles.flangeBolt} />
              <View style={styles.flangeHoleCenter} />
              <View style={styles.flangeBolt} />
            </View>
            {/* Upright nipple */}
            <View style={styles.nipplePipe} />
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 6. CATEGORY: ડ્રિપ ફિટિંગ્સ (Screenshot 1: Card 3)
    // Drip lateral coil, tee, joiner, drippers
    // -------------------------------------------------------------------------
    case 'cat-drip':
    case 'drip-fittings':
      return (
        <View style={[styles.clusterContainer, { width, height }]}>
          <View style={styles.dripClusterRow}>
            {/* Black drip lock tee & fittings */}
            <View style={styles.dripFittingsGroup}>
              <View style={styles.dripTeeShape}>
                <View style={styles.dripTeeNutLeft} />
                <View style={styles.dripTeeStem} />
                <View style={styles.dripTeeNutRight} />
              </View>
              <View style={styles.dripBarbedJoiner} />
            </View>

            {/* Black Drip lateral coil */}
            <View style={styles.dripLateralCoil}>
              <View style={styles.coilRingOuter}>
                <View style={styles.coilRingMid}>
                  <View style={styles.coilRingHole} />
                </View>
              </View>
            </View>
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 7. CATEGORY: મીની સ્પ્રિંકલર ફિટિંગ્સ (Screenshot 1: Card 4)
    // Rotary red nozzle mini sprinkler + tube + adaptor
    // -------------------------------------------------------------------------
    case 'cat-mini-sprinkler':
    case 'mini-sprinkler':
      return (
        <View style={[styles.clusterContainer, { width, height }]}>
          <View style={styles.miniSprinklerCluster}>
            {/* Takeoff Adaptor */}
            <View style={styles.sprinklerAdaptor} />
            {/* Sprinkler with Red Nozzle */}
            <View style={styles.sprinklerUnit}>
              <View style={styles.redRotaryNozzle} />
              <View style={styles.sprinklerStemRiser} />
              <View style={styles.sprinklerThreadBase} />
            </View>
            {/* Micro tube loop */}
            <View style={styles.microTubeLoop} />
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 8. CATEGORY: સ્પ્રિંકલર ફિટિંગ્સ (Screenshot 1: Card 5)
    // Quick-action couplers, elbows, tees with purple seal rings
    // -------------------------------------------------------------------------
    case 'cat-sprinkler':
    case 'sprinkler-fittings':
      return (
        <View style={[styles.clusterContainer, { width, height }]}>
          <View style={styles.sprinklerCluster}>
            {/* Coupler with purple ring */}
            <View style={styles.couplerPipe}>
              <View style={styles.couplerRingPurple} />
              <View style={styles.couplerBody} />
            </View>
            {/* Sprinkler Tee with purple seals */}
            <View style={styles.sprinklerTeeBox}>
              <View style={styles.teePurpleBand} />
              <View style={styles.teeBodyBlack} />
              <View style={styles.teePurpleBand} />
            </View>
            {/* Sprinkler Elbow */}
            <View style={styles.sprinklerElbowBox} />
          </View>
        </View>
      );

    // -------------------------------------------------------------------------
    // 9. CATEGORY: રેઇન પાઇપ ફિટિંગ્સ 40MM (Screenshot 1: Card 6)
    // Black flat rain pipe roll + blue snap connector / joiner
    // -------------------------------------------------------------------------
    case 'cat-rainpipe':
    case 'rain-pipe':
      return (
        <View style={[styles.clusterContainer, { width, height }]}>
          <View style={styles.rainPipeCluster}>
            {/* Blue Heavy Joiner with clamp */}
            <View style={styles.blueRainConnector}>
              <View style={styles.blueCollarTop} />
              <View style={styles.blueBarrelCenter} />
              <View style={styles.blueCollarBottom} />
            </View>
            {/* Rain Pipe Flat Roll */}
            <View style={styles.flatRainRoll}>
              <View style={styles.flatRollOuter}>
                <View style={styles.flatRollInner} />
              </View>
              {/* Pipe strip ribbon unrolling */}
              <View style={styles.unrolledStrip} />
            </View>
          </View>
        </View>
      );

    default:
      return (
        <View style={[styles.container, { width, height }]}>
          <Ionicons name="water" size={width * 0.5} color="#15803d" />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  clusterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  // ---------------------------------------------------------
  // 1. Union Valve Styles
  // ---------------------------------------------------------
  greenHandleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenHandleGrip: {
    width: 22,
    height: 9,
    backgroundColor: '#22c55e',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  handleHubGreen: {
    width: 14,
    height: 12,
    backgroundColor: '#15803d',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  blackStem: {
    width: 8,
    height: 5,
    backgroundColor: '#1e293b',
  },
  unionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unionCollar: {
    width: 15,
    height: 38,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rib: {
    width: 2,
    height: 28,
    backgroundColor: '#475569',
    borderRadius: 1,
  },
  unionSphere: {
    width: 32,
    height: 44,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphereHighlight: {
    width: 18,
    height: 24,
    borderRadius: 9,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
  },

  // ---------------------------------------------------------
  // 2. UPVC Valve Styles
  // ---------------------------------------------------------
  blueHandleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueHandleGrip: {
    width: 26,
    height: 9,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  handleHubBlue: {
    width: 13,
    height: 12,
    backgroundColor: '#1e40af',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  blueHandleTail: {
    width: 12,
    height: 7,
    backgroundColor: '#2563eb',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  whiteStem: {
    width: 8,
    height: 5,
    backgroundColor: '#cbd5e1',
  },
  upvcBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvcSocketLeft: {
    width: 15,
    height: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
  },
  upvcCenterSphere: {
    width: 30,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvcInnerGleam: {
    width: 16,
    height: 22,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
  },
  upvcSocketRight: {
    width: 15,
    height: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
  },

  // ---------------------------------------------------------
  // 3. Solid Valve Styles
  // ---------------------------------------------------------
  metalHandleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metalHandleBar: {
    width: 32,
    height: 6,
    backgroundColor: '#94a3b8',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#475569',
  },
  metalHandleGripBlue: {
    width: 22,
    height: 8,
    backgroundColor: '#0284c7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0369a1',
  },
  metalStem: {
    width: 8,
    height: 5,
    backgroundColor: '#64748b',
  },
  solidBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidCollarLeft: {
    width: 15,
    height: 34,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
  },
  solidCenterGlobe: {
    width: 32,
    height: 42,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidCenterRidge: {
    width: 20,
    height: 2,
    backgroundColor: '#cbd5e1',
  },
  solidCollarRight: {
    width: 15,
    height: 34,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
  },

  // ---------------------------------------------------------
  // 4. Category Valves Cluster
  // ---------------------------------------------------------
  valvesClusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  miniValveBox: {
    alignItems: 'center',
  },
  miniHandleBlack: {
    width: 14,
    height: 4,
    backgroundColor: '#0f172a',
    borderRadius: 2,
    marginBottom: 2,
  },
  miniBodyBlack: {
    width: 18,
    height: 22,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  miniValveCenter: {
    alignItems: 'center',
  },
  miniHandleGreen: {
    width: 22,
    height: 5,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    marginBottom: 2,
  },
  miniUnionBody: {
    width: 26,
    height: 32,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  miniHandleBlue: {
    width: 20,
    height: 4,
    backgroundColor: '#2563eb',
    borderRadius: 2,
    marginBottom: 2,
  },
  miniBodyBlue: {
    width: 20,
    height: 26,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748b',
  },
  miniFootValve: {
    alignItems: 'center',
  },
  footStrainerTop: {
    width: 16,
    height: 12,
    backgroundColor: '#0f172a',
    borderRadius: 4,
  },
  footStrainerMesh: {
    width: 14,
    height: 14,
    backgroundColor: '#334155',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },

  // ---------------------------------------------------------
  // 5. Category Jhatka Cluster
  // ---------------------------------------------------------
  jhatkaCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  saddleClampArc: {
    width: 28,
    height: 24,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saddleHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e3f4cb',
  },
  whitePipeJoiner: {
    width: 18,
    height: 26,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinerBand: {
    width: 18,
    height: 6,
    backgroundColor: '#94a3b8',
  },
  flangeRingRound: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  flangeHoleCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e3f4cb',
  },
  flangeBolt: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
  nipplePipe: {
    width: 10,
    height: 28,
    backgroundColor: '#94a3b8',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#64748b',
  },

  // ---------------------------------------------------------
  // 6. Category Drip Cluster
  // ---------------------------------------------------------
  dripClusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dripFittingsGroup: {
    alignItems: 'center',
    gap: 4,
  },
  dripTeeShape: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dripTeeNutLeft: {
    width: 8,
    height: 14,
    backgroundColor: '#1e293b',
    borderRadius: 2,
  },
  dripTeeStem: {
    width: 16,
    height: 8,
    backgroundColor: '#0f172a',
  },
  dripTeeNutRight: {
    width: 8,
    height: 14,
    backgroundColor: '#1e293b',
    borderRadius: 2,
  },
  dripBarbedJoiner: {
    width: 22,
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 2,
  },
  dripLateralCoil: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coilRingOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  coilRingMid: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fce1cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coilRingHole: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0f172a',
  },

  // ---------------------------------------------------------
  // 7. Category Mini Sprinkler Cluster
  // ---------------------------------------------------------
  miniSprinklerCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sprinklerAdaptor: {
    width: 16,
    height: 20,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sprinklerUnit: {
    alignItems: 'center',
  },
  redRotaryNozzle: {
    width: 24,
    height: 9,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  sprinklerStemRiser: {
    width: 6,
    height: 24,
    backgroundColor: '#0f172a',
  },
  sprinklerThreadBase: {
    width: 16,
    height: 10,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  microTubeLoop: {
    width: 22,
    height: 26,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#0f172a',
    backgroundColor: 'transparent',
  },

  // ---------------------------------------------------------
  // 8. Category Sprinkler Cluster
  // ---------------------------------------------------------
  sprinklerCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  couplerPipe: {
    alignItems: 'center',
  },
  couplerRingPurple: {
    width: 18,
    height: 6,
    backgroundColor: '#a855f7',
    borderRadius: 3,
  },
  couplerBody: {
    width: 16,
    height: 24,
    backgroundColor: '#1e293b',
    borderRadius: 3,
  },
  sprinklerTeeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teePurpleBand: {
    width: 6,
    height: 18,
    backgroundColor: '#a855f7',
    borderRadius: 2,
  },
  teeBodyBlack: {
    width: 18,
    height: 14,
    backgroundColor: '#0f172a',
  },
  sprinklerElbowBox: {
    width: 20,
    height: 20,
    backgroundColor: '#1e293b',
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },

  // ---------------------------------------------------------
  // 9. Category Rain Pipe Cluster
  // ---------------------------------------------------------
  rainPipeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  blueRainConnector: {
    alignItems: 'center',
  },
  blueCollarTop: {
    width: 18,
    height: 6,
    backgroundColor: '#0284c7',
    borderRadius: 3,
  },
  blueBarrelCenter: {
    width: 15,
    height: 24,
    backgroundColor: '#0369a1',
    borderRadius: 2,
  },
  blueCollarBottom: {
    width: 18,
    height: 6,
    backgroundColor: '#0284c7',
    borderRadius: 3,
  },
  flatRainRoll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatRollOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  flatRollInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dff4cb',
  },
  unrolledStrip: {
    width: 28,
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    marginTop: 2,
  },
});
