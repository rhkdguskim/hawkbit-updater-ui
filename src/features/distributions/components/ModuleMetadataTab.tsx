import React from 'react';
import { Checkbox, Form, Tag, type TableProps } from 'antd';
import {
    useGetMetadata1,
    useCreateMetadata1,
    useUpdateMetadata1,
    useDeleteMetadata1,
} from '@/api/generated/software-modules/software-modules';
import type { MgmtSoftwareModuleMetadata } from '@/api/generated/model';
import { useTranslation } from 'react-i18next';
import { GenericMetadataTab } from '@/components/patterns';

interface ModuleMetadataTabProps {
    softwareModuleId: number;
    isAdmin: boolean;
}

const ModuleMetadataTab: React.FC<ModuleMetadataTabProps> = ({ softwareModuleId, isAdmin }) => {
    const { t } = useTranslation('distributions');

    const extraColumns: TableProps<MgmtSoftwareModuleMetadata>['columns'] = [
        {
            title: t('metadataTab.targetVisible'),
            dataIndex: 'targetVisible',
            key: 'targetVisible',
            render: (visible: boolean) => (
                <Tag color={visible ? 'green' : 'default'}>{visible ? t('values.yes') : t('values.no')}</Tag>
            ),
        },
    ];

    const extraFormItems = (
        <Form.Item name="targetVisible" valuePropName="checked">
            <Checkbox>{t('metadataTab.targetVisible')}</Checkbox>
        </Form.Item>
    );

    return (
        <GenericMetadataTab
            entityId={softwareModuleId}
            isAdmin={isAdmin}
            t={t}
            useGetMetadata={useGetMetadata1}
            useCreateMetadata={useCreateMetadata1}
            useUpdateMetadata={useUpdateMetadata1}
            useDeleteMetadata={useDeleteMetadata1}
            mapRecordToFormValues={(record) => ({
                key: record.key,
                value: record.value,
                targetVisible: record.targetVisible,
            })}
            buildCreateVariables={(entityId, values) => {
                const { key, value, targetVisible } = values as {
                    key: string;
                    value: string;
                    targetVisible?: boolean;
                };
                return {
                    softwareModuleId: entityId,
                    data: [{ key, value, targetVisible: !!targetVisible }],
                };
            }}
            buildUpdateVariables={(entityId, metadataKey, values) => {
                const { value, targetVisible } = values as { value: string; targetVisible?: boolean };
                return {
                    softwareModuleId: entityId,
                    metadataKey,
                    data: { value, targetVisible: !!targetVisible },
                };
            }}
            buildDeleteVariables={(entityId, metadataKey) => ({
                softwareModuleId: entityId,
                metadataKey,
            })}
            extraColumns={extraColumns}
            extraFormItems={extraFormItems}
        />
    );
};

export default ModuleMetadataTab;
