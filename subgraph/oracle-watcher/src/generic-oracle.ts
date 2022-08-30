import { BigInt } from '@graphprotocol/graph-ts';
import { ValueUpdated } from '../generated/GenericOracle/GenericOracle';
import { Oracle, OracleValue } from '../generated/schema';

function loadOracle(oracleId: string): Oracle {
  let oracle = Oracle.load(oracleId);
  if (!oracle) {
    oracle = new Oracle(oracleId);
    oracle.updateCount = BigInt.fromI32(0);
  }
  oracle.save();
  return oracle;
}

export function handleValueUpdated(event: ValueUpdated): void {
  let oracle = loadOracle(event.params.id.toHex());

  const oracleCallID = event.params.oracleCallID.toHex();

  let oracleValue = OracleValue.load(oracleCallID);
  if (!oracleValue) {
    oracleValue = new OracleValue(oracleCallID);
  }

  oracleValue.value = event.params.value;
  oracleValue.date = event.params.date;
  oracleValue.oracle = oracle.id;
  oracleValue.txhash = event.transaction.hash;
  oracleValue.save();

  oracle.updateCount = oracle.updateCount.plus(BigInt.fromI32(1));
  oracle.current = oracleValue.id;
  oracle.save();
}
