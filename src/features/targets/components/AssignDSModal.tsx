import React, { useState } from 'react';
import {
    Modal,
    Form,
    Select,
    Button,
    Space,
    Alert,
    Typography,
    Divider,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import type { MgmtDistributionSet } from '@/api/generated/model';

const { Text } = Typography;

export type AssignType = 'soft' | 'forced' | 'downloadonly';

interface AssignDSModalProps {
    open: boolean;
    targetId: string;
    distributionSets: MgmtDistributionSet[];
    loading: boolean;
    dsLoading?: boolean;
    canForced: boolean;
    onConfirm: (dsId: number, type: AssignType) => void;
    onCancel: () => void;
}

const assignTypeOptions = [
    {
        value: 'soft',
        label: 'Soft',
        description: 'Device will be updated when convenient',
    },
    {
        value: 'forced',
        label: 'Forced',
        description: 'Device will be updated immediately',
    },
    {
        value: 'downloadonly',
        label: 'Download Only',
        description: 'Only download, do not install',
    },
];

const AssignDSModal: React.FC<AssignDSModalProps> = ({
    open,
    targetId,
    distributionSets,
    loading,
    dsLoading,
    canForced,
    onConfirm,
    onCancel,
}) => {
    const [form] = Form.useForm();
    const [selectedType, setSelectedType] = useState<AssignType>('soft');

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onConfirm(values.distributionSetId, values.type);
        } catch {
            // Validation error
        }
    };

    const handleTypeChange = (value: AssignType) => {
        setSelectedType(value);
        form.setFieldValue('type', value);
    };

    const filteredTypeOptions = canForced
        ? assignTypeOptions
        : assignTypeOptions.filter((opt) => opt.value !== 'forced');

    return (
        <Modal
            title="Assign Distribution Set"
            open={open}
            onCancel={onCancel}
            footer={
                <Space>
                    <Button onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        Assign
                    </Button>
                </Space>
            }
            width={500}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ type: 'soft' }}
                preserve={false}
            >
                <Alert
                    type="info"
                    message={
                        <>
                            Assigning to target: <Text strong>{targetId}</Text>
                        </>
                    }
                    style={{ marginBottom: 16 }}
                />

                <Form.Item
                    name="distributionSetId"
                    label="Distribution Set"
                    rules={[{ required: true, message: 'Please select a distribution set' }]}
                >
                    <Select
                        placeholder="Select a distribution set"
                        loading={dsLoading}
                        showSearch
                        optionFilterProp="label"
                        options={distributionSets.map((ds) => ({
                            value: ds.id,
                            label: `${ds.name} (v${ds.version})`,
                        }))}
                    />
                </Form.Item>

                <Divider />

                <Form.Item
                    name="type"
                    label="Assignment Type"
                    rules={[{ required: true, message: 'Please select an assignment type' }]}
                >
                    <Select
                        value={selectedType}
                        onChange={handleTypeChange}
                        options={filteredTypeOptions.map((opt) => ({
                            value: opt.value,
                            label: (
                                <div>
                                    <Text strong>{opt.label}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {opt.description}
                                    </Text>
                                </div>
                            ),
                        }))}
                    />
                </Form.Item>

                {!canForced && (
                    <Alert
                        type="warning"
                        message="Forced assignment requires Admin privileges"
                        style={{ marginTop: 16 }}
                    />
                )}
            </Form>
        </Modal>
    );
};

export default AssignDSModal;
