import { buildOnchainMetadata } from './utils/jetton-helpers';
import {
    Blockchain,
    SandboxContract,
    TreasuryContract,
    printTransactionFees,
    prettyLogTransactions,
    RemoteBlockchainStorage,
    wrapTonClient4ForRemote,
} from '@ton/sandbox';
import '@ton/test-utils';
import { Address, beginCell, fromNano, StateInit, toNano } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { printSeparator } from './utils/print';

import { SampleJetton, Mint, TokenTransfer } from '../build/SampleJetton/tact_SampleJetton';
import { JettonDefaultWallet, TokenBurn } from '../build/SampleJetton/tact_JettonDefaultWallet';

const jettonParams = {
    name: 'Best Practice',
    description: 'This is description of Test tact jetton',
    symbol: 'XXXE',
    image: 'SampleUrl',
};
let content = buildOnchainMetadata(jettonParams);
let max_supply = toNano(1234766689011); // Set the specific total supply in nano

describe('SampleJetton', () => {
    let blockchain: Blockchain;
    let token: SandboxContract<SampleJetton>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        // player = await blockchain.treasury("player");

        token = blockchain.openContract(await SampleJetton.fromInit(deployer.address, content, max_supply));

        // Send Transaction
        const deployResult = await token.send(deployer.getSender(), { value: toNano('10') }, 'Mint: 100');
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: true,
            success: true,
        });

        const playerWallet = await token.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and sampleJetton are ready to use
    });

    it('Test: Minting is successfully', async () => {
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
        const mintAmount = toNano(100);
        const Mint: Mint = {
            $$type: 'Mint',
            amount: mintAmount,
            receiver: deployer.address,
        };
        const mintResult = await token.send(deployer.getSender(), { value: toNano('10') }, Mint);
        expect(mintResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });
        // printTransactionFees(mintResult.transactions);

        const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
        expect(totalSupplyBefore + mintAmount).toEqual(totalSupplyAfter);

        const walletData = await jettonWallet.getGetWalletData();
        expect(walletData.owner).toEqualAddress(deployer.address);
        expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
    });

    it('Test: Mint 100', async () => {
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;

        const mintResult = await token.send(deployer.getSender(), { value: toNano('10') }, 'Mint: 100');
        expect(mintResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });

        const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
        const mintAmount = toNano(100);

        const walletData = await jettonWallet.getGetWalletData();
        console.log({ walletOwner: walletData.owner, deployer: deployer.address });
        expect(walletData.owner).toEqualAddress(deployer.address);
        expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
        console.log({ totalSupplyBefore, totalSupplyAfter, mintAmount, walletBalance: walletData.balance });
    });
});
