import React, { Component } from 'react'
import { Button, Modal, Radio } from 'semantic-ui-react'
import beeSwarmData from '../data/beeswarmData.json'
import {FlexWrapper} from './StyledComponents'
import _ from 'lodash'
import { stat } from 'fs';

class RegionFilter extends Component {
  state =   {   open: false,
                values:  _.uniq(beeSwarmData.map(d => d.region)),
                shadowValues:  _.uniq(beeSwarmData.map(d => d.region)),
                buttonColor: 'grey'
            }


  show = size => () => this.setState({ size, open: true })
  close = () => this.setState({ open: false })

  render() {
    const { open, size, values, buttonColor, shadowValues } = this.state
    const { handleSave } = this.props
    const regions =  _.uniq(beeSwarmData.map(d => d.region)).sort()
    const radioButtons = regions.map(el => <Radio 
                                            toggle 
                                            label={el} 
                                            defaultChecked={values.includes(el)}
                                            onChange={(_, o) => {
                                                const {shadowValues} = this.state
                                                const value = o.label
                                                const checked = o.checked

                                                if(checked){
                                                    this.setState(s => s.shadowValues = [...shadowValues, value])
                                                } else {
                                                    this.setState(s => s.shadowValues = shadowValues.filter(el => el !== value))
                                                }
                                                    this.setState(s => s.buttonColor = 'green')

                                            }} />)

    return (
      <div>
        <Button basic onClick={this.show('large')}>Regions</Button>

        <Modal size={size} open={open} onClose={this.close}>
          <Modal.Header>Filter for specific regions</Modal.Header>
          <Modal.Content>
            <FlexWrapper
                justify='space-between'
            >
                {radioButtons}
            </FlexWrapper>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color={buttonColor} onClick={() =>
                {
                   this.close()
                    this.setState({buttonColor: 'grey', values: shadowValues})
                    handleSave(shadowValues)
                }
                }>Save</Button>
          </Modal.Actions>
        </Modal>
      </div>
    )
  }
}

export default RegionFilter