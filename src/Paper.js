import Debug from 'debug';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Select, { components } from 'react-select';
import { FiSearch } from 'react-icons/fi';
import { AiFillCloseCircle } from 'react-icons/ai';
import TimeAgo from 'react-timeago';
import PieChart from './PieChart';
import { getOracles, getDeals } from './gql';
import { round, SUBGRAPH_CLIENTS } from './utils';
import Loader from './Loader';

const debug = Debug('Page');
const beforeTimestamp = Math.round(new Date().getTime() / 1000);
const tenMinutes = 10 * 60 * 1000;

const backgroundColor = '#0d0d12';
const borderRadius = '10px';

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor,
    cursor: 'pointer',
    textAlign: 'center',
    color: state.isFocused
      ? 'rgba(255, 255, 255, 1)'
      : 'rgba(255, 255, 255, 0.5)',
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor,
    border: 'none',
    boxShadow: 'none',
    minHeight: '60px',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor,
    marginTop: '20px',
    '& *': {
      cursor: 'pointer',
    },
    boxShadow: '0px 0px 10px 0px rgba(255, 255, 255, 0.5)',
    borderRadius,
  }),
  menuList: (provided) => ({
    ...provided,
    fontSize: '1.5em',
    borderRadius,
    maxHeight: '200px',
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
    cursor: 'text',
    justifyContent: 'center',
  }),
  placeholder: (provided) => ({
    ...provided,
    textAlign: 'center',
  }),
  valueContainer: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '1.5em',
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: 'white',
  }),
  singleValue: (provided) => ({
    ...provided,
    padding: '5px',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
  }),
};

const Control = ({ children, ...props }) => (
  <components.Control {...props}>
    <FiSearch className="search-icon" /> {children}
  </components.Control>
);
const ClearIndicator = ({ children, ...props }) => (
  <components.Control {...props}>
    <AiFillCloseCircle className="close-icon" /> {children}
  </components.Control>
);
const DropdownIndicator = ({ children, ...props }) => (
  <components.Control {...props}>{children}</components.Control>
);
const IndicatorSeparator = ({ children, ...props }) => (
  <components.Control {...props}>{children}</components.Control>
);

const Paper = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  debug('selectedOption', selectedOption);

  const {
    loading,
    error,
    data: { oracles = [] } = {},
  } = useQuery(getOracles, {
    client: SUBGRAPH_CLIENTS.oracle,
    onCompleted: debug,
    notifyOnNetworkStatusChange: true,
  });
  debug('oracles', oracles);

  const {
    loading: pocoLoading,
    error: pocoError,
    data: { deals = [] } = {},
  } = useQuery(getDeals, {
    variables: {
      timestamp: beforeTimestamp,
    },
    client: SUBGRAPH_CLIENTS.poco,
    onCompleted: debug,
    notifyOnNetworkStatusChange: true,
  });
  debug('pocoLoading', pocoLoading);
  debug('deals', deals);

  if (error)
    return <div className="paper">Graphql Request Error: {error.message}</div>;

  if (pocoError)
    return (
      <div className="paper">Graphql Request Error: {pocoError.message}</div>
    );

  const options =
    oracles?.length > 0
      ? oracles.map((e) => ({ value: e.id, label: e.id }))
      : [];

  debug('selectedOption?.value', selectedOption?.value);
  const selectedOracles = oracles.filter((oracle) =>
    selectedOption?.value === undefined
      ? true
      : oracle.id === selectedOption?.value,
  );
  debug('selectedOracles', selectedOracles);

  const selectedTaskIDs = selectedOracles.reduce(
    (accu, oracle) => accu.concat(oracle.history.map((e) => e.id)),
    [],
  );
  debug('selectedTaskIDs', selectedTaskIDs);

  const nbOfUpdates = selectedOracles.reduce(
    (accu, curr) => accu + parseInt(curr.updateCount, 10),
    0,
  );
  debug('nbOfUpdates', nbOfUpdates);

  const updateTimes = selectedOracles.reduce(
    (accu, curr) => accu.concat(curr.history.map((e) => parseInt(e.date, 10))),
    [],
  );
  debug('updateTimes', updateTimes);

  const lastUpdateTime = Math.max(...updateTimes);
  debug('lastUpdateTime', lastUpdateTime);
  debug('lastUpdateDate', new Date(lastUpdateTime * 1000));

  const lastOracleCreated = selectedOracles
    .map((oracle) => oracle.history[0])
    .sort((a, b) => b.date - a.date)[0];
  debug('lastOracleCreated', lastOracleCreated);

  const creationTimes = selectedOracles.map((oracle) =>
    parseInt(oracle.history[0].date, 10),
  );
  debug('creationTimes', creationTimes);
  const lastCreationTime = Math.max(...creationTimes);
  debug('lastCreationTime', lastCreationTime);
  debug('lastCreationDate', new Date(lastCreationTime * 1000));

  const completedDeals = deals.filter((deal) =>
    selectedTaskIDs.includes(deal?.tasks[0]?.id),
  );
  debug('completedDeals', completedDeals);

  const uniqueRequesters = new Set(
    completedDeals.map((deal) => deal.requester.id),
  );
  debug('uniqueRequesters', uniqueRequesters);

  const allTasks = deals.reduce(
    (accu, current) => accu.concat(current.tasks),
    [],
  );
  debug('allTasks[0]', allTasks[0]);
  debug('allTasks.length', allTasks.length);

  const completedTasks = completedDeals.reduce(
    (accu, current) => accu.concat(current.tasks),
    [],
  );

  const dealToInputFiles = (deal) => {
    const params = JSON.parse(deal.params);
    debug('params', params);
    const inputFiles = params.iexec_input_files[0];
    debug('inputFiles', inputFiles);
    return inputFiles;
  };

  const inputFilesToOracleID = deals.reduce((accu, deal) => {
    const inputFiles = dealToInputFiles(deal);
    const oracle = oracles.find((oracle) =>
      oracle.history.map((h) => h.id).includes(deal?.tasks[0]?.id),
    );
    debug('found oracle', oracle);
    const oracleID = oracle?.id;
    return {
      [inputFiles]: oracleID,
      ...accu,
    };
  }, {});
  debug('inputFilesToOracleID', inputFilesToOracleID);

  const allDealsWithOracleID = deals.map((deal) => {
    const oracle = oracles.find((oracle) =>
      oracle.history.map((h) => h.id).includes(deal?.tasks[0]?.id),
    );
    debug('found oracle', oracle);
    const inputFiles = dealToInputFiles(deal);

    return {
      ...deal,
      oracleID: inputFilesToOracleID[inputFiles],
    };
  });
  debug('allDealsWithOracleID', allDealsWithOracleID);

  const oracleCreationDeal = allDealsWithOracleID.find(
    (deal) => deal?.tasks[0]?.id === lastOracleCreated?.id,
  );
  debug('found oracleCreationDeal', oracleCreationDeal);

  const allTasksWithOracleID = allDealsWithOracleID.reduce((accu, deal) => {
    return accu.concat(
      deal.tasks.map((task) => ({
        oracleID: deal.oracleID,
        ...task,
      })),
    );
  }, []);
  debug('allTasksWithOracleID', allTasksWithOracleID);

  const selectedTasksWithOracleID = allTasksWithOracleID.filter((task) => {
    if (selectedOption?.value === undefined) return true;
    return selectedOption?.value === task.oracleID;
  });
  debug('selectedTasksWithOracleID', selectedTasksWithOracleID);

  const processingTimes = completedTasks.map(
    (task) =>
      Number.parseInt(task.timestamp, 10) -
      Number.parseInt(task.events[0].timestamp, 10),
  );
  debug('processingTimes', processingTimes);

  const totalProcessingTime = processingTimes.reduce(
    (accu, current) => accu + current,
    0,
  );
  debug('totalProcessingTime', totalProcessingTime);
  const avgProcessingTime = totalProcessingTime / (processingTimes.length || 1);
  debug('avgProcessingTime', avgProcessingTime);

  const shortestProcessingTime =
    processingTimes.length > 0 ? Math.min(...processingTimes) : 0;
  debug('shortestProcessingTime', shortestProcessingTime);
  const longestProcessingTime =
    processingTimes.length > 0 ? Math.max(...processingTimes) : 0;
  debug('longestProcessingTime', longestProcessingTime);

  const totalCost = completedDeals.reduce(
    (accu, deal) =>
      accu +
      parseInt(deal.datasetPrice, 10) +
      parseInt(deal.appPrice, 10) +
      parseInt(deal.workerpoolPrice, 10),
    0,
  );
  debug('totalCost', totalCost);

  const avgCost = totalCost / (nbOfUpdates || 1);

  const uniqueDatasets = new Set(
    completedDeals
      .filter((deal) => deal?.dataset !== null)
      .map(({ dataset }) => dataset.id),
  );
  debug('uniqueDatasets', uniqueDatasets);

  const notCompleted = selectedTasksWithOracleID.filter(
    (task) => task.status !== 'COMPLETED',
  );
  debug('notCompleted', notCompleted);

  const failedTasks = selectedTasksWithOracleID.filter((task) => {
    const timeDiff =
      Date.now() - Number.parseInt(task.events[0].timestamp, 10) * 1000;
    if (task.status !== 'COMPLETED' && timeDiff > tenMinutes) return true;
    return false;
  });
  debug('failedTasks', failedTasks);

  debug('selectedOption?.value', selectedOption?.value);
  const tasksByStatus = (
    selectedOption?.value === undefined ? allTasks : selectedTasksWithOracleID
  ).reduce(
    (accu, task) => ({
      ...accu,
      ...{ [task.status]: 1 + (accu[task.status] || 0) },
    }),
    { COMPLETED: 0, FAILED: 0, ACTIVE: 0 },
  );
  debug('tasksByStatus', tasksByStatus);

  const tasksByCompletion = selectedTasksWithOracleID.reduce(
    (accu, task) => {
      let status;
      const timeDiff =
        Date.now() - Number.parseInt(task.events[0].timestamp, 10) * 1000;
      debug('timeDiff', timeDiff);

      if (task.status === 'COMPLETED') status = 'COMPLETED';
      if (
        ['ACTIVE', 'REVEALING'].includes(task.status) &&
        timeDiff > tenMinutes
      )
        status = 'FAILED';
      return {
        ...accu,
        ...{ [status]: 1 + (accu[status] || 0) },
      };
    },
    { COMPLETED: 0, FAILED: 0, ACTIVE: 0, REVEALING: 0 },
  );
  debug('tasksByCompletion', tasksByCompletion);

  const colorByStatus = {
    COMPLETED: '#FFD15A',
    FAILED: '#EF5454',
    ACTIVE: '#6DC7FF',
    REVEALING: '#CE2C68',
  };
  const pieChartData = Object.keys(tasksByCompletion)
    .filter((status) => tasksByCompletion[status] !== 0)
    .map((status) => ({
      tooltip: status,
      value: tasksByCompletion[status],
      color: colorByStatus[status],
    }));
  debug('pieChartData', pieChartData);

  return (
    <div className="paper">
      <div className="paper-container">
        <div className="search-section">
          <div className="search-subsection">
            <div className="searchbar">
              <div className="selector">
                <Select
                  styles={customStyles}
                  options={options}
                  isMulti={false}
                  isSearchable={true}
                  placeholder={'Search Oracle'}
                  components={{
                    Control,
                    ClearIndicator,
                    DropdownIndicator,
                    IndicatorSeparator,
                  }}
                  escapeClearsValue={true}
                  hideSelectedOptions={false}
                  isClearable={true}
                  closeMenuOnSelect={true}
                  noOptionsMessage={() =>
                    loading ? 'Loading Oracles' : 'No Oracle found'
                  }
                  isLoading={loading}
                  value={selectedOption}
                  onChange={setSelectedOption}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="metric-tiles">
          <div className="tile a">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={loading}>{selectedOracles.length}</Loader>
              </div>
              <div className="metric-desc"># of Oracles</div>
            </div>
          </div>
          <div className="tile b">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={loading}>{nbOfUpdates}</Loader>
              </div>
              <div className="metric-desc"># of Completed Updates</div>
            </div>
          </div>
          <div className="tile c">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>{uniqueRequesters.size}</Loader>
              </div>
              <div className="metric-desc"># of Requesters</div>
            </div>
          </div>
          <div className="tile d">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>
                  {round(avgProcessingTime / 60, 1)} min.
                </Loader>
              </div>
              <div className="metric-desc">Avg Oracle Update Time</div>
            </div>
          </div>
          <div className="e">
            <div className="tile-inner-container">
              <PieChart className="pie-chart-div" data={pieChartData} />
              <div className="metric-desc">Status of Oracle Updates</div>
            </div>
          </div>
          <div className="tile f">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>{failedTasks.length}</Loader>
              </div>
              <div className="metric-desc"># of Failed Updates</div>
            </div>
          </div>
          <div className="tile f">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>{totalCost} RLC</Loader>
              </div>
              <div className="metric-desc">Cost of All Oracle Updates</div>
            </div>
          </div>
          <div className="tile g">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>
                  <TimeAgo date={new Date(lastCreationTime * 1000)} />
                </Loader>
              </div>
              <div className="metric-desc">Last Oracle Creation</div>
            </div>
          </div>
          <div className="tile h">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>{avgCost} RLC</Loader>
              </div>
              <div className="metric-desc">Oracle Update Avg Cost</div>
            </div>
          </div>
          <div className="tile i">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>{uniqueDatasets.size}</Loader>
              </div>
              <div className="metric-desc"># of Encrypted API Keys</div>
            </div>
          </div>
          <div className="tile j">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader isLoading={pocoLoading}>
                  <TimeAgo date={new Date(lastUpdateTime * 1000)} />
                </Loader>
              </div>
              <div className="metric-desc">Last Oracle Update</div>
            </div>
          </div>
          <div className="tile j">
            <div className="tile-inner-container">
              <div className="stat-value">
                <Loader
                  isLoading={pocoLoading && oracleCreationDeal !== undefined}
                >
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://blockscout-bellecour.iex.ec/address/${oracleCreationDeal?.requester?.id}`}
                  >
                    {oracleCreationDeal?.requester?.id
                      ?.slice(0, 5)
                      .concat('...')}
                  </a>
                </Loader>
              </div>
              <div className="metric-desc">Oracle Creator</div>
            </div>
          </div>
        </div>
        <div className="spacer"></div>
        <div className="build-oracle-section">
          <div className="build-oracle-subsection">
            <div className="build-oracle-text">Build my Oracle</div>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://oracle-factory.iex.ec/builder"
              className="build-oracle-button"
            >
              Go to the Oracle Factory
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paper;
