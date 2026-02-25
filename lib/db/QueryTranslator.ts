/**
 * Utility to translate CosmosDB SQL queries to MongoDB Filter objects.
 */
export class QueryTranslator {
    /**
     * Translates a CosmosDB SQL query to a MongoDB filter.
     * Supported patterns:
     * - SELECT * FROM c WHERE c.field = 'value'
     * - SELECT * FROM c WHERE c.field > 10
     * - SELECT * FROM c WHERE ARRAY_CONTAINS(c.tags, 'value')
     * - SELECT * FROM c WHERE c.field IN ('v1', 'v2')
     */
    public static translate(sql: string): any {
        const filter: any = {};

        // 1. Extract WHERE clause
        const whereMatch = sql.match(/WHERE\s+(.*)$/i);
        if (!whereMatch) return filter;

        const whereClause = whereMatch[1].trim();

        // 2. Handle simple conditions joined by AND (basic support)
        const conditions = whereClause.split(/\s+AND\s+/i);

        for (const condition of conditions) {
            this.parseCondition(condition, filter);
        }

        return filter;
    }

    private static parseCondition(condition: string, filter: any) {
        // Remove table prefix 'c.'
        const cleanCondition = condition.trim().replace(/c\./g, '');

        // Equality: field = 'value'
        const eqMatch = cleanCondition.match(/^(\w+)\s*=\s*'([^']+)'$/);
        if (eqMatch) {
            filter[eqMatch[1]] = eqMatch[2];
            return;
        }

        // Numeric Equality: field = 10
        const numEqMatch = cleanCondition.match(/^(\w+)\s*=\s*(\d+)$/);
        if (numEqMatch) {
            filter[numEqMatch[1]] = parseInt(numEqMatch[2], 10);
            return;
        }

        // Greater than: field > 10
        const gtMatch = cleanCondition.match(/^(\w+)\s*>\s*(\d+)$/);
        if (gtMatch) {
            filter[gtMatch[1]] = { $gt: parseInt(gtMatch[2], 10) };
            return;
        }

        // Less than: field < 10
        const ltMatch = cleanCondition.match(/^(\w+)\s*<\s*(\d+)$/);
        if (ltMatch) {
            filter[ltMatch[1]] = { $lt: parseInt(ltMatch[2], 10) };
            return;
        }

        // ARRAY_CONTAINS(field, 'value')
        const arrayMatch = cleanCondition.match(/^ARRAY_CONTAINS\((\w+),\s*'([^']+)'\)$/i);
        if (arrayMatch) {
            filter[arrayMatch[1]] = { $in: [arrayMatch[2]] };
            return;
        }

        // IN clause: field IN ('v1', 'v2')
        const inMatch = cleanCondition.match(/^(\w+)\s+IN\s*\(([^)]+)\)$/i);
        if (inMatch) {
            const values = inMatch[2].split(',').map(s => s.trim().replace(/'/g, ''));
            filter[inMatch[1]] = { $in: values };
            return;
        }
    }
}
