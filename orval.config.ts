import { defineConfig } from 'orval';

export default defineConfig({
    hawkBit: {
        input: {
            target: './docs/api-spec/management/openapi.json',
        },
        output: {
            mode: 'tags-split',
            target: './src/api/generated',
            schemas: './src/api/generated/model',
            client: 'react-query',
            mock: false,
            override: {
                mutator: {
                    path: './src/api/axios-instance.ts',
                    name: 'axiosInstance',
                },
            },
        },
    },
});
