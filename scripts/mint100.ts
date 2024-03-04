import { Address, toNano } from '@ton/core';
import { SampleJetton } from '../wrappers/SampleJetton';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const myErc20 = provider.open(SampleJetton.fromAddress(address));
    const data = await myErc20.getGetJettonData();
    console.log(data);

    await myErc20.send(
        provider.sender(),
        {
            value: toNano('0.1'),
        },
        'Mint: 100',
    );
}
