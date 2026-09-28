import type { BenchId } from "@/course/types";
import {
  AxialBench,
  BoltBench,
  BucklingBench,
  CrackBench,
  DeflectionBench,
  DesignBench,
  FatigueBench,
  MeanBench,
  NotchBench,
  ReactionsBench,
  TradeoffBench,
} from "./engineering-labs";
import { isLadderBench, LadderBench } from "./ladder-labs";
import {
  AshbyBench,
  BondBench,
  CompareBench,
  CurveBench,
  FamiliesBench,
  GrainBench,
  StrainBench,
} from "./materials-labs";
import {
  ChipBench,
  FreezeBench,
  HazBench,
  MechanismBench,
  SpreadBench,
  SpringbackBench,
  StackBench,
} from "./manufacturing-labs";
import {
  CollisionBench,
  EnergyBench,
  FbdBuilderBench,
  FrictionInclineBench,
  KinematicsBench,
  NewtonBench,
  VectorBench,
  WaveBench,
} from "./physics-labs";

export function Bench({ id }: { id: BenchId }) {
  if (isLadderBench(id)) return <LadderBench id={id} />;
  switch (id) {
    case "families":
      return <FamiliesBench />;
    case "bonding":
      return <BondBench />;
    case "curve":
      return <CurveBench />;
    case "compare":
      return <CompareBench />;
    case "grains":
      return <GrainBench />;
    case "ashby":
      return <AshbyBench />;
    case "strain":
      return <StrainBench />;
    case "design":
      return <DesignBench />;
    case "beam-reactions":
      return <ReactionsBench />;
    case "axial":
      return <AxialBench />;
    case "deflection":
      return <DeflectionBench />;
    case "tradeoffs":
      return <TradeoffBench />;
    case "buckling":
      return <BucklingBench />;
    case "notch":
      return <NotchBench />;
    case "fatigue":
      return <FatigueBench />;
    case "crack":
      return <CrackBench />;
    case "bolt":
      return <BoltBench />;
    case "mean":
      return <MeanBench />;
    case "vectors":
      return <VectorBench />;
    case "kinematics":
      return <KinematicsBench />;
    case "newton":
      return <NewtonBench />;
    case "incline":
      return <FrictionInclineBench />;
    case "fbdbuilder":
      return <FbdBuilderBench />;
    case "energy":
      return <EnergyBench />;
    case "collision":
      return <CollisionBench />;
    case "wave":
      return <WaveBench />;
    case "mechanism":
      return <MechanismBench />;
    case "chip":
      return <ChipBench />;
    case "springback":
      return <SpringbackBench />;
    case "freeze":
      return <FreezeBench />;
    case "haz":
      return <HazBench />;
    case "spread":
      return <SpreadBench />;
    case "stack":
      return <StackBench />;
  }
}
