import React, { Component } from "react";

import { select } from "d3-selection";
import { nest } from "d3-collection";
import { extent } from "d3-array";
import { format } from "d3-format";
import { timeParse } from "d3-time-format";
import { axisLeft, axisBottom } from "d3-axis";
import { line, curveMonotoneX } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { Delaunay } from "d3-delaunay";
import "d3-transition"

import { ChartContainer, SmallTooltip, secondaryColorLight } from "./StyledComponents";

import { svgDimensions, appendArea } from "./chartFunctions";

class LineChart extends Component {
  state = {
    firstRender: false,
    voronoi: {
      year: "",
      country: "",
      economicClass: "",
      metricValue: ""
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { firstRender, voronoi } = this.state;
    const { valueList, metric, year, width, highlighted } = this.props;

    if (!firstRender) {
      this.initVis();
      this.setState(state => (state.firstRender = true));
    }

    if (
      prevState.voronoi.year !== voronoi.year ||
      prevState.voronoi.country ||
      voronoi.country
    ) {
      this.circleHover();
    }

    if(
      prevProps.highlighted !== highlighted
    ){
      this.highlightLine()
    }

    if (
      prevProps.valueList.length !== valueList.length ||
      prevProps.metric !== metric ||
      prevProps.year !== year
    ) {
      this.updateData();
    }

    if(prevProps.width !== width){
      console.log('dims');
      this.updateDims()
    }


  }

  initVis() {
    this.svg = select(this.node);

    const { width, height, margin, showYAxis } = this.props,
      { data, transition } = this.props,
      { chartWidth, chartHeight } = svgDimensions(
        this.svg,
        width,
        height,
        margin
      );

    this.parseTime = timeParse("%Y");

    this.chartHeight = chartHeight;
    this.chartWidth = chartWidth;

    data.forEach(d => (d.formattedDate = this.parseTime(d.year)));

    const nestedData = nest()
      .key(d => d.country)
      .entries(data);

    this.nestedData = nestedData

    appendArea(this.svg, "chart-area", margin.left, margin.top);
    appendArea(this.svg, "yAxis-area", margin.left, margin.top);
    appendArea(this.svg, "xAxis-area", margin.left, margin.top + chartHeight);

    this.chartArea = this.svg.select(".chart-area");

    const yAxis = this.svg.select(".yAxis-area");
    this.xAxis = this.svg.select(".xAxis-area");

    this.yScale = scaleLinear()
      .domain([0, 5])
      .range([chartHeight, 0]);
    this.xScale = scaleTime()
      .domain(extent(data, d => d.formattedDate))
      .range([0, chartWidth]);

    this.xAxis
      .transition("update")
      .duration(transition.long)
      .call(
        axisBottom(this.xScale)
          .tickSizeOuter(0)
          .tickSizeInner(5)
          .tickValues(this.xScale.domain())
      );

    this.xAxis.selectAll(".tick line").remove();

    if(showYAxis){
      yAxis
        .transition("update")
        .duration(transition.long)
        .call(
          axisLeft(this.yScale)
            .tickSizeOuter(0)
            .tickSizeInner(5)
            .tickValues([1, 2, 3, 4, 5])
            .tickFormat(format("d"))
        );

      yAxis.selectAll(".domain").remove();
      yAxis.selectAll(".tick line").remove()
    }



    this.lineGenerator = line()
      .x(d => this.xScale(d.formattedDate))
      .y(d => this.yScale(d.value))
      .curve(curveMonotoneX);

    this.createUpdateLines(nestedData, 'in', transition.long);
    this.createUpdateCircles('in', transition.long);
    this.createUpdateVoronoi('in', 0);
  }

  updateData() {

    const { data, transition } = this.props;

    data.forEach(d => (d.formattedDate = this.parseTime(d.year)));

    const nestedData = nest()
      .key(d => d.country)
      .entries(data);

    this.nestedData = nestedData

    this.createUpdateLines(nestedData, 'update', transition.long);
    this.createUpdateCircles('update', transition.long);
    this.createUpdateVoronoi('update', transition.long);
  }

  updateDims() {

    const { width, height, margin } = this.props,
          { chartWidth } = svgDimensions(
            this.svg,
            width,
            height,
            margin
          );

    this.xScale.range([0, chartWidth]);

    this.xAxis
      .transition("update")
      .duration(0)
      .call(
        axisBottom(this.xScale)
          .tickSizeOuter(0)
          .tickSizeInner(5)
          .tickValues(this.xScale.domain())
      );

    this.createUpdateLines(this.nestedData, 'update', 0);
    this.createUpdateCircles('update', 0);
    this.createUpdateVoronoi('update', 0);

  }

  circleHover() {
    const { voronoi } = this.state;
    const { year } = this.props;

    this.chartArea
      .selectAll(".circle")
      .attr("r", d =>
        (voronoi.year === d.year && voronoi.country === d.country) ||
        year === d.year
          ? 5
          : 0
      );
  }

  highlightLine(){

    const { highlighted, transition } = this.props

    if(highlighted){
      this.chartArea.selectAll('.line').transition('highlight').duration(transition.short).attr('opacity', d => d.key === highlighted ? 1 : .1)
      this.chartArea.selectAll('.circle').transition('highlight').duration(transition.short).attr('opacity', d => d.country === highlighted ? 1 : .1)
    } else {
      this.chartArea.selectAll('.line').transition('unhighlight').duration(transition.short).attr('opacity', 1)
      this.chartArea.selectAll('.circle').transition('unhighlight').duration(transition.short).attr('opacity', 1)
    }

  }

  createUpdateLines(data, transition,duration) {
    const { colorScale, highlighted } = this.props,
      { long } = transition,
      lines = this.chartArea.selectAll(".line").data(data, d => d.key);

    lines
      .exit()
      .transition("out")
      .duration(long)
      .attr("stroke-width", 0)
      .remove();

    lines
      .enter()
      .append("path")
      .attr("class", d => `line`)
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.values[0].economicClass))
      .attr("stroke-width", 0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr('opacity', d =>highlighted ? d.key === highlighted ? 1 : .1 : 1)
      .attr("d", d => this.lineGenerator(d.values))
      .merge(lines)
      .transition(transition)
      .duration(duration)
      .attr("stroke-width", 2)
      .attr("stroke", d => colorScale(d.values[0].economicClass))
      .attr("d", d => this.lineGenerator(d.values));
  }

  createUpdateCircles( transition, duration ) {
    const { year, data, colorScale, highlighted } = this.props,
      { long } = transition,
      circles = this.chartArea
        .selectAll(".circle")
        .data(data, d => d.country + d.formattedDate),
      date = data.filter(d => d.year === year)[0].formattedDate;

    if (!this.chartArea.select(".year-line")._groups[0][0]) {
      this.chartArea
        .append("line")
        .attr("class", `year-line`)
        .attr("x1", this.xScale(date))
        .attr("x2", this.xScale(date))
        .attr("y1", this.yScale(0))
        .attr("y2", this.yScale(5))
        .style("stroke", secondaryColorLight)
        .attr("stroke-dasharray", "5, 2")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", '1px');

    } else {
      this.chartArea
        .select(".year-line")
        .transition("update")
        .duration(duration)
        .attr("x1", this.xScale(date))
        .attr("x2", this.xScale(date));
    }

    circles
      .exit()
      .transition("out")
      .duration(long)
      .attr("r", 0)
      .remove();

    circles
      .enter()
      .append("circle")
      .attr("class", d => `circle`)
      .attr("fill", d => colorScale(d.economicClass))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr('opacity', d => highlighted ? d.key === highlighted ? 1 : .1 : 1)
      .attr("r", 0)
      .attr("cy", d => this.yScale(d.value))
      .attr("cx", d => this.xScale(d.formattedDate))
      .merge(circles)
      .transition(transition)
      .duration(duration)
      .attr("r", d => (year === d.year ? 5 : 0))
      .attr("fill", d => colorScale(d.economicClass))
      .attr("cy", d => this.yScale(d.value))
      .attr("cx", d => this.xScale(d.formattedDate));
  }

  createUpdateVoronoi(transition, duration) {
    const { data, margin, handleClick } = this.props;

    const voronoi = Delaunay.from(
      data,
      d => this.xScale(d.formattedDate),
      d => this.yScale(d.value)
    ).voronoi([0, 0, this.chartWidth, this.chartHeight]);

    const voronois = this.chartArea.selectAll(".voronoi-path").data(data);
    const tooltip = select(this.tooltip);

    voronois.exit().remove();

    voronois
      .enter()
      .append("path")
      // .attr('stroke', '#333')
      .attr("fill", "none")
      .attr("class", d => `voronoi-path`)
      .attr("pointer-events", "all")
      .attr("d", (d, i) => voronoi.renderCell(i))
      .on("mouseover", d => {
        this.setState({
          voronoi: {
            year: d.year,
            country: d.country,
            economicClass: d.economicClass,
            metricValue: d.value.toFixed(2)
          }
        });

        tooltip.style("display", "block");

        const tooltipWidth = tooltip._groups[0][0].clientWidth;
        const tooltipHeight = tooltip._groups[0][0].clientHeight;

        tooltip
          .style(
            "left",
            this.xScale(d.formattedDate) + margin.left - tooltipWidth / 2 + "px"
          )
          .style("top", this.yScale(d.value) - tooltipHeight + 8 + "px");
      })
      .on("mouseout", () => {
        this.setState({
          voronoi: {
            year: "",
            country: "",
            economicClass: ""
          }
        });

        tooltip.style("display", "none");
      })
      .on('click', handleClick)
      .merge(voronois)
      .transition(transition)
      .duration(duration)
      .attr("d", (d, i) => voronoi.renderCell(i));
  }

  render() {
    const { colorScale, metric, highlighted } = this.props;
    const { voronoi } = this.state;
    const color = colorScale(voronoi.economicClass && voronoi.economicClass);
    const hint = highlighted ? 'unhighlight' : 'highlight'

    return (
      <div>
        <ChartContainer ref={div => (this.div = div)}>
          <svg ref={node => (this.node = node)} />
          <SmallTooltip ref={tooltip => (this.tooltip = tooltip)} color={color}>
            <h4>{voronoi.country}</h4>
            <p>
              {metric} ({voronoi.year}):
            </p>
            <p className="score">{voronoi.metricValue}</p>
            <p><span>Click</span> here to {hint}!</p>
          </SmallTooltip>
        </ChartContainer>
      </div>
    );
  }
}

LineChart.defaultProps = {
  margin: {
    top: 25,
    right: 50,
    bottom: 25,
    left: 15
  },
  transition: {
    long: 1000,
    short: 300
  }
};

export default LineChart;
