import type { IStage } from '@spinnaker/core';
import {
  ArtifactReferenceService,
  ExecutionArtifactTab,
  ExecutionDetailsTasks,
  ExpectedArtifactService,
  Registry,
} from '@spinnaker/core';

import { DeployManifestStageConfig } from './DeployManifestStageConfig';
import { deployManifestValidators } from './deployManifest.validator';
import { DeployStatus } from './manifestStatus/DeployStatus';

Registry.pipeline.registerStage({
  label: 'Deploy (Manifest)',
  description: 'Deploy a Kubernetes manifest yaml/json file.',
  key: 'deployManifest',
  cloudProvider: 'kubernetes',
  component: DeployManifestStageConfig,
  executionDetailsSections: [DeployStatus, ExecutionDetailsTasks, ExecutionArtifactTab],
  producesArtifacts: true,
  supportsCustomTimeout: true,
  validators: deployManifestValidators(),
  accountExtractor: (stage: IStage): string[] => (stage.context.account ? [stage.context.account] : []),
  configAccountExtractor: (stage: any): string[] => (stage.account ? [stage.account] : []),
  artifactExtractor: ExpectedArtifactService.accumulateArtifacts(['manifestArtifactId', 'requiredArtifactIds']),
  artifactRemover: ArtifactReferenceService.removeArtifactFromFields(['manifestArtifactId', 'requiredArtifactIds']),
});
