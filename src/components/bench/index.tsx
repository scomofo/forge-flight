import { BondEnergyBench, BondPredictBench } from "./bonding-labs";
import type { BenchId } from "@/course/types";
import {
  AxialBench,
  BoltBench,
  BucklingBench,
  ComponentSizingBench,
  CrackBench,
  DeflectionBench,
  DesignBench,
  ErrorBudgetBench,
  FatigueBench,
  MeanBench,
  NotchBench,
  ReactionsBench,
  SectionExplorerBench,
  SensitivityBench,
  SweepBench,
  TradeStudyBench,
  TradeoffBench,
} from "./engineering-labs";
import { LadderBench, isLadderBench } from "./ladder-labs";
import {
  AllowableBench,
  AshbyBench,
  BondBench,
  CompareBench,
  CorroCheckBench,
  CreepLifeBench,
  CurveBench,
  CurveReadBench,
  DefectBench,
  DiffProfileBench,
  FamCompareBench,
  FamDecisionBench,
  FamiliesBench,
  ForensicsBench,
  GlassFormBench,
  GrainBench,
  MatCheckBench,
  MatLedgerBench,
  MicroInterpBench,
  PhaseSetBench,
  ProcessMemoBench,
  PropCompareBench,
  ShortlistBench,
  SnLifeBench,
  SolidifyBench,
  SparLabBench,
  StrainBench,
  StrengthExplorerBench,
  TempLimitBench,
  UnitCellBench,
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
  BeamDeflectionBench,
  BeamReactionsBench,
  CmExploreBench,
  CollisionBench,
  DimCheckBench,
  EnergyAuditBench,
  EnergyBench,
  FbdBuilderBench,
  FermiBench,
  FrictionInclineBench,
  GliderLabBench,
  GliderPreLabBench,
  HydroBench,
  ImpactLabBench,
  KinematicsBench,
  MasteryBench,
  MemoBench,
  MotionReconBench,
  NewtonBench,
  ProjectileBench,
  ResonanceSweepBench,
  RestitutionLabBench,
  RotInertiaBench,
  ShmBench,
  SpeedPredictBench,
  StressStrainBench,
  SynthLedgerBench,
  ThermalStressBench,
  TorqueBalanceBench,
  VectorBench,
  VenturiBench,
  WaveBench,
} from "./physics-labs";
import {
  PowersBench,
  RearrangeBench,
  SlopeBench,
  TrigBench,
  UnitsBench,
} from "./math-labs";
import { AssumptionLedgerBench, ReqPacketBench } from "./engineering-w21-labs";
import { FmeaBench, LoadPathBench } from "./engineering-w23-labs";
import { JointRecordBench, JointStrengthBench } from "./engineering-w25-labs";
import { ProcChoiceBench, TolStackBench } from "./engineering-w26-labs";
import { DoeBench, LabReportBench } from "./engineering-w27-labs";
import { DesignReviewBench, StandardsBench } from "./engineering-w29-labs";
import { CapPackageBench, CapPredictBench, CapReviewBench } from "./engineering-w30-labs";

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
    case "shortlist":
      return <ShortlistBench />;
    case "corrocheck":
      return <CorroCheckBench />;
    case "strain":
      return <StrainBench />;
    case "matledger":
      return <MatLedgerBench />;
    case "sparlab":
      return <SparLabBench />;
    case "matcheck":
      return <MatCheckBench />;
    case "curveread":
      return <CurveReadBench />;
    case "propcompare":
      return <PropCompareBench />;
    case "allowable":
      return <AllowableBench />;
    case "bondenergy":
      return <BondEnergyBench />;
    case "bondpredict":
      return <BondPredictBench />;
    case "design":
      return <DesignBench />;
    case "designreview":
      return <DesignReviewBench />;
    case "standards":
      return <StandardsBench />;
    case "jointrecord":
      return <JointRecordBench />;
    case "jointstrength":
      return <JointStrengthBench />;
    case "reqpacket":
      return <ReqPacketBench />;
    case "ledger":
      return <AssumptionLedgerBench />;
    case "units":
      return <UnitsBench />;
    case "rearrange":
      return <RearrangeBench />;
    case "powers":
      return <PowersBench />;
    case "slope":
      return <SlopeBench />;
    case "trig":
      return <TrigBench />;
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
    case "doe":
      return <DoeBench />;
    case "labreport":
      return <LabReportBench />;
    case "tolstack":
      return <TolStackBench />;
    case "procchoice":
      return <ProcChoiceBench />;
    case "loadpath":
      return <LoadPathBench />;
    case "fmea":
      return <FmeaBench />;
    case "errbudget":
      return <ErrorBudgetBench />;
    case "sensbench":
      return <SensitivityBench />;
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
    case "energyaudit":
      return <EnergyAuditBench />;
    case "dropspeed":
      return <SpeedPredictBench />;
    case "collision":
      return <CollisionBench />;
    case "wave":
      return <WaveBench />;
    case "hydro":
      return <HydroBench />;
    case "venturi":
      return <VenturiBench />;
    case "gliderprelab":
      return <GliderPreLabBench />;
    case "beamdefl":
      return <BeamDeflectionBench />;
    case "stressstrain":
      return <StressStrainBench />;
    case "impactlab":
      return <ImpactLabBench />;
    case "cmexplore":
      return <CmExploreBench />;
    case "restitute":
      return <RestitutionLabBench />;
    case "mechanism":
      return <MechanismBench />;
    case "chip":
      return <ChipBench />;
    case "shmlab":
      return <ShmBench />;
    case "resonancesweep":
      return <ResonanceSweepBench />;
    case "thermalstress":
      return <ThermalStressBench />;
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
    case "cappackage":
      return <CapPackageBench />;
    case "cappredict":
      return <CapPredictBench />;
    case "capreview":
      return <CapReviewBench />;
    case "tradestudy":
      return <TradeStudyBench />;
    case "sweepconv":
      return <SweepBench />;
    case "sections":
      return <SectionExplorerBench />;
    case "sizebeam":
      return <ComponentSizingBench />;
    case "famcompare":
      return <FamCompareBench />;
    case "templim":
      return <TempLimitBench />;
    case "famdecision":
      return <FamDecisionBench />;
    case "phaseset":
      return <PhaseSetBench />;
    case "solidify":
      return <SolidifyBench />;
    case "forensics":
      return <ForensicsBench />;
    case "snlife":
      return <SnLifeBench />;
    case "creeplife":
      return <CreepLifeBench />;
    case "strengthlab":
      return <StrengthExplorerBench />;
    case "processmemo":
      return <ProcessMemoBench />;
    case "defects":
      return <DefectBench />;
    case "diffprofile":
      return <DiffProfileBench />;
    case "unitcell":
      return <UnitCellBench />;
    case "microinterp":
      return <MicroInterpBench />;
    case "glassform":
      return <GlassFormBench />;
    case "synthledger":
      return <SynthLedgerBench />;
    case "gliderlab":
      return <GliderLabBench />;
    case "mastery":
      return <MasteryBench />;
    case "torquebal":
      return <TorqueBalanceBench />;
    case "rotinertia":
      return <RotInertiaBench />;
    case "beamrxn":
      return <BeamReactionsBench />;
    case "motionrecon":
      return <MotionReconBench />;
    case "projrange":
      return <ProjectileBench />;
    case "dimcheck":
      return <DimCheckBench />;
    case "fermi":
      return <FermiBench />;
    case "memo":
      return <MemoBench />;
  }
}
