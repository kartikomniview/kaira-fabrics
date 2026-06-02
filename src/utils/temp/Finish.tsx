import $ from "jquery";
import React, { useEffect, useState } from "react";
import { saveUploadedFileInCache } from "../../../../../utils/cache/cache";
import { getItemFromLocalStorage } from "../../../../../utils/cache/localstorage";
import { configuration, updateModuleFinish, updateTexture, updateTextureFromTextureInfo } from "../../../../../utils/customizein3d/modules/customizein3d";
import { TextureInfo } from "../../../../../utils/customizer/ProjectConfiguration";
import { applicationConfig, categoryFilteredTextures, getClientFilteredMaterials, getFilteredArray, getObjectByParameter, getRandomString, getSubDomainName, getUser, onlyLaminatesProducts } from "../../../../../utils/methods";
import { STORE } from "../../../../../utils/store/storeConfiguration";
import { showGlobalToast } from "../../../../../utils/UI_methods/global";
import FilteredMaterials from "../../../shared-components/Materials/FilteredMaterials";
import Materials from "../../../shared-components/Materials/Materials";
import UploadImage from "../../../ui-components/forms/UploadImage";
import MaterialFilteres from "./MaterialFilteres";
import Materials2 from "components/common/shared-components/Materials/Materials2";
import Materials2Horizontal from "components/common/shared-components/Materials/Materials2Horizontal";

const Finish: React.FC<{
  configObj: any;
}> = (props) => {

  const [allProductMaterials,setAllProductMaterials]: any = useState([]);
  const [isFilteredMaterialMode,setIsFilteredMaterialMode]: any = useState(false);
  const [filteredMaterials,setFilteredMaterials]: any = useState(false);
  const[storeFronts] = useState(applicationConfig?.user?.storeFronts || [])

  function getStoreFrontId() {
    let result = 0
    let productId =  configuration.product?.productId || configuration.product?.product_id
    if(productId){
        result = getObjectByParameter(applicationConfig.data?.productsList,"product_id",productId)?.storefront_id
    }
    return result
  }

  useEffect(()=>{
    let materials = props.configObj?.data.materials || []
    if(configuration){
      let currProduct = configuration.product
      // if(applicationConfig?.clientName.toLowerCase().includes("democlient")){
      //   materials = getApplicationFiltersMaterials("Customizer",props.configObj?.data.materials,props.configObj?.data.applicationMaterials)
      // }
      //Filter With storeFronts
      materials = getClientFilteredMaterials(materials)

      if(currProduct && configuration.productWithOwnCollection.includes(currProduct.product_name)){
        const productMaterials = materials.filter((currMaterial:any)=> currMaterial.collection_name === currProduct?.product_name)
        materials = productMaterials
      }else{
        materials = materials.filter((currMaterial:any)=> !configuration.productWithOwnCollection.includes(currMaterial.collection_name))
      }
      

      if(storeFronts?.length > 1 && applicationConfig.clientName === "DashSquare"){
        let currStoreFrontId = getStoreFrontId()
        if(currStoreFrontId){
          materials = getFilteredArray(materials,"storefront_id",currStoreFrontId)
        }
        if(STORE.currProduct?.product_name === "Modmax"){
          materials = getFilteredArray(props.configObj?.data.materials,"company_name","Ashley")
        }
       
      }

      let categoryName = currProduct?.categoryName || currProduct?.category_name


      if(STORE.isTvUnit){
        materials = getFilteredArray(props.configObj?.data.materials,"company_name","GreenLam")
      }else{
        if(onlyLaminatesProducts.includes(categoryName)){
          materials = materials.filter(currMaterial=> currMaterial.material_type === "Wood" || currMaterial.material_type === "Laminate")
        }else{
          materials = categoryFilteredTextures(materials,props.configObj?.data.objectMaterialTypes,categoryName)
        }
      }
   
      materials = setByPriority(materials)
      STORE.data.materialsForCustomization = materials
      setAllProductMaterials(materials)
    }

    if(STORE.isKanvasMode){
      let collection = getItemFromLocalStorage("currCollection")
      if(collection){
        let companyName = collection.companyName
        let collectionName = collection.collectionName
        let collections = [collectionName]
        if(collection.collectionList){
          collections = collection.collectionList
        }
        if(getUser()?.isShareMode){
          materials = props.configObj?.data.materials.filter(currMaterial=> currMaterial.company_name === companyName && collections.includes(currMaterial.collection_name))
          STORE.data.materialsForCustomization = materials
          setAllProductMaterials(materials)
        }else{
          STORE.data.materialsForCustomization = materials
          setAllProductMaterials(materials)
        }
      }else{
        window.location.href = "/login"
      }
    }

    props.configObj.setFunctionRef("customizein3d",{setTextures:setAllProductMaterials})
  },[configuration])


  function setByPriority(materials:any){
    let index = -1
    let materialToAdd = null
    for (let i = 0; i < materials.length; i++) {
      const currMater = materials[i]
      if(currMater.material_code === "07303"){
        index = i
        materialToAdd = currMater
      }
      
    }
    if (index !== -1) {
      materials.splice(index, 1); 
      materials.push(materialToAdd);
    }
    return materials
  }



  async function changeFinish(val:any) {
    const blob = new Blob([val]);
    let textureInfo = new TextureInfo({
      companyName:"Demo",
      collectionName:"Mesh",
      materialCode:"Uploaded_"+getRandomString(5),
      materialType:"Mesh"
    })
    let key = `thumbnails/OVL/${textureInfo.companyName}/${textureInfo.collectionName}/${textureInfo.materialCode}.png`
    let result = await saveUploadedFileInCache(key,blob)
    updateModuleFinish(textureInfo)
    showGlobalToast("Finish Applied",2000)
  }

  function getFilteredMaterials(){
    let result = []
    let colorGroups = STORE.finishFilters.colorGroups
    let materialTypes = STORE.finishFilters.materialTypes
    let patterns = STORE.finishFilters.patterns


    if(materialTypes.length && colorGroups.length && patterns.length){
      return allProductMaterials.filter(currM => materialTypes.includes(currM.material_type) && colorGroups.includes(currM.color_group) && patterns.includes(currM.pattern))
    }

    if(materialTypes.length && colorGroups.length){
      return allProductMaterials.filter(currM => colorGroups.includes(currM.color_group) && materialTypes.includes(currM.material_type))
    }
    if(materialTypes.length && patterns.length){
      return allProductMaterials.filter(currM => patterns.includes(currM.pattern) && materialTypes.includes(currM.material_type))
    }
    if(colorGroups.length && patterns.length){
      return allProductMaterials.filter(currM => colorGroups.includes(currM.color_group) && patterns.includes(currM.pattern))
    }

    if(colorGroups.length){
      result = allProductMaterials.filter(currM => colorGroups.includes(currM.color_group))
    }
    if(patterns.length){
      result = allProductMaterials.filter(currM => patterns.includes(currM.pattern))
    }
    if(materialTypes.length){
      result = allProductMaterials.filter(currM => materialTypes.includes(currM.material_type))
    }
    return result
  }


  async function confirmFilteredMaterial(){
    setIsFilteredMaterialMode(true)
    setFilteredMaterials(getFilteredMaterials())
  }

  function resetFilters(){
    STORE.finishFilters.reset()
    setIsFilteredMaterialMode(false)
    setFilteredMaterials([])
    $(".filter-option-icon").find(".check-icon").addClass("display-none")
    // $(".materials-filter-wrapper").addClass("display-none")
    $(".material-filter-options-container").find(".check-icon-search").addClass("display-none")
  }

  function confirmSearchAction(materials:any){
    // $(".materials-filter-wrapper").addClass("display-none")
    setIsFilteredMaterialMode(true)
    setFilteredMaterials(materials)
    $(".material-filter-options-container").find(".check-icon-search").removeClass("display-none")
  }

 
  return (
    <div className="products-left-sidebar full-height-width position-relative display-flex-column no-wrap"
      style={{ justifyContent: "flex-start",paddingBottom:"0" }}>
      <MaterialFilteres filteredMaterials={filteredMaterials}  confirmAction={()=>confirmFilteredMaterial()} confirmSearchAction={confirmSearchAction} resetFilters={resetFilters}/>
      {allProductMaterials.length?
      <>
      {isFilteredMaterialMode?
        <FilteredMaterials
          materials={filteredMaterials}
          action={updateTextureFromTextureInfo}
          moduleName="customizein3d"
          isFilteredMaterialMode={isFilteredMaterialMode}
          exitMode={()=>resetFilters()}
        />
      :
      <>
      {STORE?.isQuick3DView?
        <Materials2Horizontal
          materials={allProductMaterials}
          action={updateTextureFromTextureInfo}
          moduleName="customizein3d"
        />
      :
        <Materials2
          materials={allProductMaterials}
          action={updateTextureFromTextureInfo}
          moduleName="customizein3d"
        />
      }
        
      </>
      }
        
        
      </>
         
      :
        <div className="middle heading4">Materials Not Available</div>
      }


      {STORE?.currProduct?.category_name === "Chairs"?
        <UploadImage
            setSelectedFile={changeFinish}
            imageElementId={"clientLogo"}
            isButton={true}
        />
      :
      null
      }
    </div>
  );
};

export default Finish;