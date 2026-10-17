import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertRuleDto } from './create-alert-rule.dto.js';

export class UpdateAlertRuleDto extends PartialType(CreateAlertRuleDto) {}
