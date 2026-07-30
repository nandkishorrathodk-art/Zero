export class ReportBuilder {
    build(modules) {
        const report = {
            timestamp: Date.now(),
            status: 'success',
            criticalErrors: 0,
            majorErrors: 0,
            minorErrors: 0,
            warnings: 0,
            details: {}
        };

        let allErrors = [];

        Object.entries(modules).forEach(([name, mod]) => {
            if (typeof mod.getResults === 'function') {
                const results = mod.getResults();
                report.details[name] = results;
                
                if (results.errors) {
                    allErrors = allErrors.concat(results.errors);
                }
                if (results.warnings) {
                    report.warnings += results.warnings.length;
                }
            }
        });

        allErrors.forEach(err => {
            if (err.severity === 'critical') report.criticalErrors++;
            else if (err.severity === 'major') report.majorErrors++;
            else if (err.severity === 'minor') report.minorErrors++;
            else report.minorErrors++; // fallback
        });

        if (report.criticalErrors > 0 || report.majorErrors > 0) {
            report.status = 'failed';
        } else if (report.minorErrors > 0 || report.warnings > 0) {
            report.status = 'passed_with_warnings';
        }

        report.allErrors = allErrors;
        return report;
    }
}
