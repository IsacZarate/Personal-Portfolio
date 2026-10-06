import { App } from 'aws-cdk-lib';
import { realConfig, validationConfig } from './config';
import { PortfolioStack } from './portfolio-stack';

const app = new App();
const validation = app.node.tryGetContext('validation') === 'true';
const config = validation ? validationConfig : realConfig(process.env);
new PortfolioStack(app, 'PersonalPortfolio', config);
app.synth();
