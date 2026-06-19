// const db = require('../../../config/config');
// const Contract = db.contract
// const renewal_request = db.renewal_request
// const ContractType = db.contract_type
// // Add a new renewal request
// const add_renewal_request = async (req, res) => {
//     const userId = req.user.id;
//     try {
//         const renewalAttachmentFile = req.file ? req.file.path : null;
//         const {
//             contractId,
//             description,
//             amendments,
//             previousExpirationDate,
//             newExpirationDate,
//             additionalNotes,
//             selectDepartment,
//             vendorName,
//             contractPrice,
//             addService
//         } = req.body;

//         // Check if required fields are empty
//         const requiredFields = [
//             'contractId',
//             'description',
//             'previousExpirationDate',
//             'newExpirationDate',
//             'selectDepartment',
//         ];

//         const isEmptyKey = requiredFields.some(field => {
//             const value = req.body[field];
//             return value === null || value === undefined;
//         });

//         if (isEmptyKey) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Please fill in all required fields',
//             });
//         }

//         // Create the new renewal request
//         const newRenewalRequest = await renewal_request.create({
//             contractId,
//             description,
//             amendments,
//             previousExpirationDate,
//             newExpirationDate,
//             additionalNotes,
//             selectDepartment,
//             renewalAttachmentFile,
//             vendorName,
//             contractPrice,
//             addService,

//             userId
//         });

//         if (!newRenewalRequest) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Renewal request not created',
//             });
//         }

//         return res.status(201).json({
//             status: true,
//             message: 'Renewal request added successfully',
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

// // Get all renewal requests
// const get_all_renewal_requests = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 7;
//         const offset = (page - 1) * limit;

//         const { rows: renewalRequests, count: totalRecords } = await renewal_request.findAndCountAll({
//             limit,
//             offset,
//             include: [
//                 {
//                     model: Contract,
//                     as: 'contract',
//                     attributes: ['id', 'contractName', 'contractTypeId'],
//                 },
//             ],

//         });

//         if (renewalRequests.length === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'No renewal requests found',
//                 data: [],
//             });
//         }

//         const totalPages = Math.ceil(totalRecords / limit);

//         return res.status(200).json({
//             status: true,
//             message: 'Renewal requests fetched successfully',
//             data: renewalRequests,
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalRecords,
//                 limit,
//             },
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

// // Update a renewal request
// const update_renewal_request = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedRequest = await renewal_request.update(req.body, { where: { id } });

//         if (updatedRequest[0] === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Renewal request not found',
//             });
//         }

//         return res.status(200).json({
//             status: true,
//             message: 'Renewal request updated successfully',
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

// // Delete a renewal request
// const delete_renewal_request = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const deletedRequest = await renewal_request.destroy({ where: { id } });

//         if (deletedRequest === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Renewal request not found',
//             });
//         }

//         return res.status(200).json({
//             status: true,
//             message: 'Renewal request deleted successfully',
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

// module.exports = {
//     add_renewal_request,
//     get_all_renewal_requests,
//     update_renewal_request,
//     delete_renewal_request,
// };




const db = require('../../../config/config');
const Contract = db.contract;
const renewal_request = db.renewal_request;
const ContractType = db.contract_type;

// Add a new renewal request
// const add_renewal_request = async (req, res) => {
//     const userId = req.user.id;
//     try {
//         const renewalAttachmentFile = req.file ? req.file.path : null;
//         const {
//             contractId,
//             description,
//             amendments,
//             previousExpirationDate,
//             newExpirationDate,
//             additionalNotes,
//             selectDepartment,
//             vendorName,
//             contractPrice,
//             addService
//         } = req.body;

//         const requiredFields = [
//             'contractId',
//             'description',
//             'previousExpirationDate',
//             'newExpirationDate',
//             'selectDepartment',
//         ];

//         const isEmpty = requiredFields.some(field => {
//             const value = req.body[field];
//             return value === null || value === undefined || value === '';
//         });

//         if (isEmpty) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Please fill in all required fields',
//             });
//         }

//         const newRenewalRequest = await renewal_request.create({
//             contractId,
//             description,
//             amendments,
//             previousExpirationDate,
//             newExpirationDate,
//             additionalNotes,
//             selectDepartment,
//             renewalAttachmentFile,
//             vendorName,
//             contractPrice,
//             addService,
//             userId
//         });

//         return res.status(201).json({
//             status: true,
//             message: 'Renewal request added successfully',
//         });
//     } catch (error) {
//         console.error("Add renewal error:", error);
//         return res.status(500).json({
//             status: false,
//             message: 'Failed to add renewal request',
//         });
//     }
// };

const add_renewal_request = async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType; // superadmin / admin
    const { id } = req.params; // ID path se aayega (update mode me)

    try {
        // ✅ Handle file
        const renewalAttachmentFile = req.file ? req.file.path : undefined;

        const {
            contractId,
            description,
            amendments,
            previousExpirationDate,
            newExpirationDate,
            additionalNotes,
            selectDepartment,
            vendorName,
            contractPrice,
            addService
        } = req.body;

        const requiredFields = [
            'contractId',
            'description',
            'previousExpirationDate',
            'newExpirationDate',
            'selectDepartment',
        ];

        const isEmpty = requiredFields.some(field => {
            const value = req.body[field];
            return value === null || value === undefined || value === '';
        });

        if (isEmpty) {
            return res.status(400).json({
                status: false,
                message: 'Please fill in all required fields',
            });
        }

        // 🔁 UPDATE MODE (agar ID present ho)
        if (id) {
            // 🔍 Existing record check
            const existing = await renewal_request.findByPk(id);
            if (!existing) {
                return res.status(404).json({
                    status: false,
                    message: 'Renewal request not found',
                });
            }

            // 🔒 Permission check: Admin can only edit own requests
            if (userType !== 'superadmin' && existing.userId !== userId) {
                return res.status(403).json({
                    status: false,
                    message: 'Unauthorized to update this request',
                });
            }

            // ✅ Prepare update data
            const updateData = {
                contractId,
                description,
                amendments,
                previousExpirationDate,
                newExpirationDate,
                additionalNotes,
                selectDepartment,
                vendorName,
                contractPrice,
                addService,
            };

            // ✅ Update file only if new one uploaded
            if (renewalAttachmentFile !== undefined) {
                updateData.renewalAttachmentFile = renewalAttachmentFile;
            }

            // ✅ Perform update
            await renewal_request.update(updateData, { where: { id } });

            return res.status(200).json({
                status: true,
                message: 'Renewal request updated successfully',
            });
        }

        // ➕ ADD MODE (ID nahi hai)
        const newRenewalRequest = await renewal_request.create({
            contractId,
            description,
            amendments,
            previousExpirationDate,
            newExpirationDate,
            additionalNotes,
            selectDepartment,
            renewalAttachmentFile,
            vendorName,
            contractPrice,
            addService,
            userId, // ✅ Owner set karo
        });

        return res.status(201).json({
            status: true,
            message: 'Renewal request added successfully',
        });

    } catch (error) {
        console.error("Add/Update renewal error:", error);
        return res.status(500).json({
            status: false,
            message: 'Failed to process renewal request',
        });
    }
};

// Get renewal requests (role-based)
const get_all_renewal_requests = async (req, res) => {
    try {
        const { id: userId, userType } = req.user;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const offset = (page - 1) * limit;

        let whereCondition = {};
        if (userType !== 'superadmin') {
            whereCondition.userId = userId;
        }

        const { rows: renewalRequests, count: totalRecords } = await renewal_request.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            include: [
                {
                    model: Contract,
                    as: 'contract',
                    attributes: ['id', 'contractName', 'contractTypeId'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        if (renewalRequests.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'No renewal requests found',
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalRecords: 0,
                    limit,
                },
            });
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Renewal requests fetched successfully',
            data: renewalRequests,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
        });
    } catch (error) {
        console.error("Fetch renewals error:", error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch renewal requests',
        });
    }
};

//updated

const update_renewal_request = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, userType } = req.user;

        const existing = await renewal_request.findByPk(id);
        if (!existing) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found',
            });
        }

        if (userType !== 'superadmin' && existing.userId !== userId) {
            return res.status(403).json({
                status: false,
                message: 'Unauthorized to update this request',
            });
        }

        // ✅ Handle file upload
        const renewalAttachmentFile = req.file ? req.file.path : undefined;

        // ✅ Build update object
        const updateFields = {
            ...req.body,
            ...(renewalAttachmentFile !== undefined && { renewalAttachmentFile })
        };

        // ✅ Remove userId (security)
        delete updateFields.userId;

        const [updated] = await renewal_request.update(updateFields, {
            where: { id }
        });

        if (updated === 0) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Renewal request updated successfully',
        });
    } catch (error) {
        console.error("Update renewal error:", error);
        return res.status(500).json({
            status: false,
            message: 'Failed to update renewal request',
        });
    }
};
// Delete renewal request (with permission check)
const delete_renewal_request = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, userType } = req.user;

        const existing = await renewal_request.findByPk(id);
        if (!existing) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found',
            });
        }

        if (userType !== 'superadmin' && existing.userId !== userId) {
            return res.status(403).json({
                status: false,
                message: 'Unauthorized to delete this request',
            });
        }

        const deleted = await renewal_request.destroy({ where: { id } });

        if (deleted === 0) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Renewal request deleted successfully',
        });
    } catch (error) {
        console.error("Delete renewal error:", error);
        return res.status(500).json({
            status: false,
            message: 'Failed to delete renewal request',
        });
    }
};

// Process renewal request (convert to active contract)
const process_renewal_request = async (req, res) => {
    try {
        const { id } = req.params;
        const renewalRequest = await renewal_request.findByPk(id, {
            include: [{ model: Contract, as: 'contract' }]
        });

        if (!renewalRequest) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found'
            });
        }

        const originalContract = renewalRequest.contract;
        if (!originalContract) {
            return res.status(404).json({
                status: false,
                message: 'Original contract not found'
            });
        }

        // Create renewed contract
        const renewedContract = await Contract.create({
            contractName: `${originalContract.contractName} - Renewed (Manual)`,
            description: renewalRequest.description || originalContract.description,
            contractTypeId: originalContract.contractTypeId,
            departmentId: renewalRequest.selectDepartment || originalContract.departmentId,
            startDate: renewalRequest.previousExpirationDate || new Date(),
            endDate: renewalRequest.newExpirationDate,
            sourceLeadName: originalContract.sourceLeadName,
            sourceDirectorName: originalContract.sourceDirectorName,
            buisnessStackHolder: originalContract.buisnessStackHolder,
            supplierId: originalContract.supplierId,
            budget: renewalRequest.contractPrice || originalContract.budget,
            currency: originalContract.currency,
            paymentTerms: originalContract.paymentTerms,
            milestones: originalContract.milestones,
            contractAttachmentFile: renewalRequest.renewalAttachmentFile,
            userId: req.user.id,
            status: 'Active'
        });

        // Update original contract status
        await originalContract.update({ status: 'Renewed' });

        // Update renewal request status
        await renewalRequest.update({ status: 'Processed' });

        return res.status(200).json({
            status: true,
            message: 'Renewal request processed and contract created successfully',
            data: renewedContract
        });
    } catch (error) {
        console.error('Error processing renewal request:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to process renewal request',
            error: error.message
        });
    }
};

module.exports = {
    add_renewal_request,
    get_all_renewal_requests,
    update_renewal_request,
    delete_renewal_request,
    process_renewal_request
};