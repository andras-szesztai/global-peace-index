import React, { Component } from 'react'
import { Button, Modal, Radio } from 'semantic-ui-react'
import beeSwarmData from '../data/beeswarmData.json'
import {FlexWrapper} from './StyledComponents'
import _ from 'lodash'

class RegionFilter extends Component {
  state =   {   open: false,
                values:  _.uniq(beeSwarmData.map(d => d.region)),
                shadowValues:  _.uniq(beeSwarmData.map(d => d.region)),
                buttonColor: 'grey'
            }


  show = size => () => this.setState({ size, open: true })
  close = () => {this.setState({buttonColor: 'grey', open: false})
}
  render() {
    const { open, size, values, buttonColor, shadowValues } = this.state
    const { handleSave, filterButtonColor } = this.props
    const regions =  _.uniq(beeSwarmData.map(d => d.region)).sort()
    const radioButtons = regions.map(el => <Radio 
                                            key={el}
                                            toggle 
                                            label={el} 
                                            defaultChecked={values.includes(el)}
                                            onChange={(e, o) => {
                                                const {shadowValues} = this.state
                                                const value = o.label
                                                const checked = o.checked

                                                if(checked){
                                                    this.setState(s => s.shadowValues = [...shadowValues, value])
                                                } else {
                                                    this.setState(s => s.shadowValues = shadowValues.filter(el => el !== value))
                                                }

                                            }} />)    

        const changedValuesOne = _.difference(values, shadowValues)
        const changedValuesTwo = _.difference(shadowValues, values) 

        if(changedValuesOne.length > 0 || changedValuesTwo.length > 0){
            if(buttonColor !== 'green'){
            this.setState(s => s.buttonColor = 'green')
            }
        } else {
            if(buttonColor !== 'grey'){
            this.setState(s => s.buttonColor = 'grey')
            }
        }                                                  
           
    return (
      <div>
        <Button basic 
                onClick={this.show('large')}
                color={filterButtonColor}
                >Regions filter</Button>

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
                    this.setState({values: shadowValues})
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