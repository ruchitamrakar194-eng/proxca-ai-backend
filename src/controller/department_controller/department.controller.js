const db = require("../../../config/config");
const bcrypt = require("bcrypt");

const Department = db.department;
const sequelize = db.sequelize; // import your sequelize instance
const User = db.user;
// Create a new department
const add_department = async (req, res) => {
  const userId = req.user.id;
  try {
    const { name, description, email, password, userType, permissions, role, type } = req.body;
    const notEncryptPassword = password;
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const department = await Department.create({
      name,
      description,
      email_id: email,
      password: hashedPassword,
      userType,
      userId,
      permissions,
      role,
      notEncryptPassword,
      type
    });

    res.status(201).json({
      status: true,
      message: "Department added successfully!",
      data: department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      status: false,
      message: "Failed to add department",
      error: error.message,
    });
  }
};

// Get all departments
const get_all_departments = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';

    // Build where clause based on user role
    let whereClause = {};
    if (isSuperAdmin) {
      whereClause = {};
    } else if (userType === 'department') {
      // Department users only see themselves
      whereClause = { id: userId };
    } else {
      // Admin (and others) see departments they created
      whereClause = { userId: userId };
    }

    const departments = await Department.findAll({
      where: whereClause
    });

    // Robustly parse permissions field into an array of strings
    const formattedDepartments = departments.map((dept) => {
      let rawPermissions = dept.permissions || [];
      let parsedPermissions = [];

      if (typeof rawPermissions === "string") {
        try {
          // Try parsing as JSON first (in case it's stringified array)
          const parsed = JSON.parse(rawPermissions);
          parsedPermissions = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Fallback to comma-separated
          parsedPermissions = rawPermissions.split(",").map(p => p.trim());
        }
      } else if (Array.isArray(rawPermissions)) {
        parsedPermissions = rawPermissions;
      }

      // Ensure each item in the array is a string (name)
      parsedPermissions = parsedPermissions.map(p => typeof p === "object" ? p.name : p).filter(Boolean);

      return {
        ...dept.toJSON(),
        permissions: parsedPermissions,
      };
    });

    res.status(200).json({
      status: true,
      message: "Departments fetched successfully!",
      data: formattedDepartments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};
const get_department_by_id = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';

    const { id } = req.params;

    // Build where clause - Admin users can only see their own departments
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const department = await Department.findOne({ where: whereClause });

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    // Robustly parse permissions into an array of strings
    let rawPermissions = department.permissions || [];
    let parsedPermissions = [];

    if (typeof rawPermissions === "string") {
      try {
        const parsed = JSON.parse(rawPermissions);
        parsedPermissions = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        parsedPermissions = rawPermissions.split(",").map(p => p.trim());
      }
    } else if (Array.isArray(rawPermissions)) {
      parsedPermissions = rawPermissions;
    }

    // Ensure each item in the array is a string (name)
    parsedPermissions = parsedPermissions.map(p => typeof p === "object" ? p.name : p).filter(Boolean);

    res.status(200).json({
      status: true,
      message: "Department fetched successfully!",
      data: {
        ...department.toJSON(),
        permissions: parsedPermissions,
      },
    });
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch department",
      error: error.message,
    });
  }
};


// Update a department
const update_department = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';

    const { id } = req.params;

    // Build where clause - Admin users can only update their own departments
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const department = await Department.findOne({ where: whereClause });

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    // If password is provided, hash it before updating
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Update fields using req.body
    await department.update(req.body);

    res.status(200).json({
      status: true,
      message: "Department updated successfully!",
      data: department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update department",
      error: error.message,
    });
  }
};
// Delete a department
const delete_department = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';

    const { id } = req.params;

    // Build where clause - Admin users can only delete their own departments
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const department = await Department.findOne({ where: whereClause });

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    // 1. Nullify references in linked tables to avoid deletion block (Foreign Key Constraints)
    
    // Contracts
    await db.contract.update({ departmentId: null }, { where: { departmentId: id } });

    // Intake Requests
    await db.intake_request.update({ requesterDepartmentId: null }, { where: { requesterDepartmentId: id } });

    // Transactions
    await db.transaction.update({ departmentId: null }, { where: { departmentId: id } });

    // Suppliers
    await db.supplier.update({ departmentId: null }, { where: { departmentId: id } });

    // Intake Request Approvers (Note: userId field points to department id in this system)
    await db.intake_request_approvers.update({ userId: null }, { where: { userId: id, userType: 'department' } });

    // SOW Consolidation (requestedTeamDepartmentId)
    await db.service_sow_consolidation.update({ requestedTeamDepartmentId: null }, { where: { requestedTeamDepartmentId: id } });

    // Client Licenses
    await db.client_license.update({ department_id: null }, { where: { department_id: id } });

    await department.destroy();

    res.status(200).json({
      status: true,
      message: "Department deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete department",
      error: error.message,
    });
  }
};
const add_department_flow = async (req, res) => {
  const userId = req.user.id;
  const departments = req.body.departments;

  const transaction = await sequelize.transaction(); // 🔁 Start transaction

  try {
    const created = [];

    for (const dept of departments) {
      const {
        name,
        description,
        email,
        password,
        userType,
        permissions,
        role,
        type,
      } = dept;

      if (!password) throw new Error("Password is required");

      const hashedPassword = await bcrypt.hash(password, 10);

      const department = await Department.create(
        {
          name,
          description,
          email_id: email,
          password: hashedPassword,
          userType: userType || type,
          userId,
          permissions: permissions || [],
          role,
          notEncryptPassword: password,
          type,
        },
        { transaction }
      );

      created.push(department);
    }

    // ✅ Update user: mark isApprovalFlow true
    const user = await User.update(
      { isapprovalFlow: true },
      {
        where: { id: userId },
        transaction,
      }
    );
    await transaction.commit(); // ✅ Commit transaction

    res.status(201).json({
      status: true,
      message: "Departments added and approval flow marked successfully!",
      data: created,
    });
  } catch (error) {
    await transaction.rollback(); // ❌ Rollback transaction
    console.error("Error creating departments:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create department flow. Rolled back changes.",
      error: error.message,
    });
  }
};

const assign_request_flow = async (req, res) => {
  const { intakeRequestId, departmentIds } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // 1. Delete existing approvers for this request to reset flow
    await db.intake_request_approvers.destroy({
      where: { intakeRequestId },
      transaction
    });

    // 2. Create new approver entries for each selected department
    // Note: departmentIds are the IDs of the department records which act as approvers
    const approverEntries = departmentIds.map((deptId, index) => ({
      intakeRequestId,
      userId: deptId, // In this system, userId in approvers points to department.id
      status: 'pending',
      userType: 'department'
    }));

    console.log("APPROVER ENTRIES:", JSON.stringify(approverEntries, null, 2));

    await db.intake_request_approvers.bulkCreate(approverEntries, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: true,
      message: "Approval flow assigned successfully to the request.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("ASSIGN_REQUEST_FLOW_ERROR:", error);
    if (error.parent) {
      console.error("SQL_ERROR_DETAILS:", error.parent);
    }
    res.status(500).json({
      status: false,
      message: "Failed to assign approval flow.",
      error: error.message,
    });
  }
};

const update_department_workflow_status = async (req, res) => {
  try {
    const { intakeRequestId, status, departmentId, comment, assigncontractTemplateId } = req.body;

    if (!intakeRequestId || !status) {
      return res.status(400).json({ status: false, message: "intakeRequestId and status are required." });
    }

    // Security: If user is a department, force their own ID
    let targetDepartmentId = departmentId;
    if (req.user?.userType === 'department') {
      targetDepartmentId = req.user.id;
    }

    if (!targetDepartmentId) {
      return res.status(400).json({ status: false, message: "Department ID is required." });
    }

    const transaction = await db.sequelize.transaction();
    try {
      console.log(`[WORKFLOW_UPDATE] ReqID: ${intakeRequestId}, DeptID: ${targetDepartmentId}, Status: ${status}, Contract: ${assigncontractTemplateId}`);

      // 1. Update the status in intake_request_approvers
      const [updated] = await db.intake_request_approvers.update(
        { status, comments: comment },
        { where: { intakeRequestId, userId: targetDepartmentId }, transaction }
      );

      console.log(`[WORKFLOW_UPDATE] Approver records updated: ${updated}`);

      if (updated === 0) {
        await transaction.rollback();
        return res.status(404).json({ status: false, message: `Approver record not found for request ${intakeRequestId} and department ${targetDepartmentId}.` });
      }

      // 2. If a contract template is provided, override it in the main intake_request
      if (assigncontractTemplateId) {
        console.log(`[WORKFLOW_UPDATE] Overriding contract template to: ${assigncontractTemplateId}`);
        await db.intake_request.update(
          { assigncontractTemplateId },
          { where: { id: intakeRequestId }, transaction }
        );
      }

      // 3. Add a comment to the intake_request_comment table as well for history
      if (comment) {
        await db.intake_request_comment.create({
          requestId: intakeRequestId,
          userId: req.user?.id || null, // Logged in user who made the action
          commentMessage: `${status.toUpperCase()}: ${comment}${assigncontractTemplateId ? ' (Contract Template Updated)' : ''}`,
          userType: req.user?.userType || 'department',
          departmentId: targetDepartmentId
        }, { transaction });
      }

      // 4. Recompute overall request status based on ALL approver statuses
      const allApprovers = await db.intake_request_approvers.findAll({ 
        where: { intakeRequestId }, 
        transaction 
      });

      if (allApprovers.length > 0) {
        const hasRejected = allApprovers.some(app => app.status === 'rejected');
        const areAllApproved = allApprovers.every(app => app.status === 'approved');

        let newOverallStatus;
        if (hasRejected) {
          newOverallStatus = 'rejected';
        } else if (areAllApproved) {
          newOverallStatus = 'approved';
        } else {
          // Some pending, some approved — request is still active/in-progress
          newOverallStatus = 'active';
        }

        console.log(`[WORKFLOW_UPDATE] Recomputed overall status for request ${intakeRequestId}: ${newOverallStatus}`);
        await db.intake_request.update(
          { status: newOverallStatus },
          { where: { id: intakeRequestId }, transaction }
        );
      }

      await transaction.commit();
      res.status(200).json({
        status: true,
        message: `Department status updated to ${status} successfully.`,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("Error updating department workflow status:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update department status.",
      error: error.message,
    });
  }
};

module.exports = {
  add_department,
  get_all_departments,
  update_department,
  delete_department,
  get_department_by_id,
  add_department_flow,
  assign_request_flow,
  update_department_workflow_status
};
