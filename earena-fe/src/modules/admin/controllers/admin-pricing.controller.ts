import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AdminService } from '../admin.service';
import { AdminCreatePricingPlanDto, AdminUpdatePricingPlanDto } from '../dto/admin-pricing.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('admin/pricing-plans')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPricingController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async list() {
    return this.adminService.listPricingPlans();
  }

  @Post()
  async create(@Body() dto: AdminCreatePricingPlanDto) {
    return this.adminService.createPricingPlan(dto as any);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: AdminUpdatePricingPlanDto) {
    return this.adminService.updatePricingPlan(id, dto);
  }
}
