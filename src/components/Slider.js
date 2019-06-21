import Slider from '@material-ui/lab/Slider';
import { withStyles } from '@material-ui/core/styles';
import { secondaryColor } from './StyledComponents'

const YearSlider = withStyles({
  root: {
    color: 'rgba(34,36,38,.15)',
    height: 8,
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: secondaryColor,
    marginTop: -6,
    marginLeft: -6,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% - 4px)',
    color: secondaryColor
  },
  track: {
    height: 1,
    borderRadius: 4,
  },
  rail: {
    height: 1,
    borderRadius: 4,
  },
})(Slider);

export default YearSlider
