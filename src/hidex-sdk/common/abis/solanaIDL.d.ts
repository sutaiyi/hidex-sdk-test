declare const _default: {
    version: string;
    name: string;
    instructions: {
        name: string;
        accounts: {
            name: string;
            isMut: boolean;
            isSigner: boolean;
        }[];
        args: ({
            name: string;
            type: string;
        } | {
            name: string;
            type: {
                array: (string | number)[];
            };
        })[];
    }[];
    accounts: {
        name: string;
        type: {
            kind: string;
            fields: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    array: (string | number)[];
                };
            })[];
        };
    }[];
    types: {
        name: string;
        type: {
            kind: string;
            variants: {
                name: string;
            }[];
        };
    }[];
    errors: {
        code: number;
        name: string;
        msg: string;
    }[];
};
export default _default;
//# sourceMappingURL=solanaIDL.d.ts.map