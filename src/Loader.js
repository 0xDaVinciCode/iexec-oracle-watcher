import { PulseLoader } from 'react-spinners';

const Loader = (props) => {
  if (props.isLoading)
    return <PulseLoader className="pulseloader" size={13} color="#ffffff" />;
  return props.children;
};

export default Loader;
