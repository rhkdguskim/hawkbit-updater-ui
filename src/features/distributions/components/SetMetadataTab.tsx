import React from 'react';
import {
    useGetMetadata2,
    useCreateMetadata2,
    useUpdateMetadata2,
    useDeleteMetadata2,
} from '@/api/generated/distribution-sets/distribution-sets';
import { useTranslation } from 'react-i18next';
import { GenericMetadataTab } from '@/components/patterns';

interface SetMetadataTabProps {
    distributionSetId: number;
    isAdmin: boolean;
}

const SetMetadataTab: React.FC<SetMetadataTabProps> = ({ distributionSetId, isAdmin }) => {
    const { t } = useTranslation('distributions');

    return (
        <GenericMetadataTab
            entityId={distributionSetId}
            isAdmin={isAdmin}
            t={t}
            useGetMetadata={useGetMetadata2}
            useCreateMetadata={useCreateMetadata2}
            useUpdateMetadata={useUpdateMetadata2}
            useDeleteMetadata={useDeleteMetadata2}
            buildCreateVariables={(entityId, values) => {
                const { key, value } = values as { key: string; value: string };
                return {
                    distributionSetId: entityId,
                    data: [{ key, value }],
                };
            }}
            buildUpdateVariables={(entityId, metadataKey, values) => {
                const { value } = values as { value: string };
                return {
                    distributionSetId: entityId,
                    metadataKey,
                    data: { value },
                };
            }}
            buildDeleteVariables={(entityId, metadataKey) => ({
                distributionSetId: entityId,
                metadataKey,
            })}
        />
    );
};

export default SetMetadataTab;
