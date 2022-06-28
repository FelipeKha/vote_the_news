import React from "react"
import ContentLoader from "react-content-loader"

const MyLoader = (props) => (
  <ContentLoader 
    speed={2}
    width={400}
    height={460}
    viewBox="0 0 400 460"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="0" y="0" rx="2" ry="2" width="400" height="200" />
    <rect x="5" y="205" rx="2" ry="2" width="390" height="25" /> 
    <rect x="5" y="235" rx="2" ry="2" width="390" height="25" /> 
    <rect x="5" y="265" rx="2" ry="2" width="390" height="10" /> 
    <rect x="5" y="280" rx="2" ry="2" width="390" height="10" /> 
    <rect x="5" y="295" rx="2" ry="2" width="390" height="10" /> 
    <rect x="5" y="310" rx="2" ry="2" width="140" height="10" /> 
    <rect x="200" y="325" rx="2" ry="2" width="90" height="10" /> 
    <rect x="300" y="325" rx="2" ry="2" width="90" height="10" /> 
  </ContentLoader>
)

export default MyLoader