import Slider from '@material-ui/lab/Slider';
import { withStyles } from '@material-ui/core/styles';


const YearSlider = withStyles({
  root: {
    color: '#333',
    height: 8,
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: '#333',
    border: '2px solid currentColor',
    marginTop: -6,
    marginLeft: -6,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% - 8px)',
  },
  track: {
    height: 2,
    borderRadius: 4,
  },
  rail: {
    height: 2,
    borderRadius: 4,
  },
})(Slider);

export default YearSlider
