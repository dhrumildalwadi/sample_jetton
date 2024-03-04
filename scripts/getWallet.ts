import { Address, toNano } from '@ton/core';
import { SampleJetton } from '../wrappers/SampleJetton';
import { JettonDefaultWallet } from '../build/SampleJetton/tact_JettonDefaultWallet';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(
        args.length > 0 ? args[0] : await ui.input('EQC9n0fj62_bx1XLuzmAIjMrHLI9sgnm3Cc72WGuHSgvF2y1'),
    );

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const myErc20 = provider.open(SampleJetton.fromAddress(address));
    const data = await myErc20.getGetWalletAddress(Address.parse('EQC_Plca4eerzxQxck0R0zzI0N12w18M4uM2fv-hQZojzXbO'));
    console.log(data);

    const jettonWallet = provider.open(JettonDefaultWallet.fromAddress(data));
    const balance = await jettonWallet.getGetWalletData();
    console.log(balance.balance);
}
