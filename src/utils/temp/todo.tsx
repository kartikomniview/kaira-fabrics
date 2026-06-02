// Add these variables in configuration 


  productWithOwnCollection = ["9666","JD6016","ZX0007","ZX0012B","ZX0022","ModMaxII","DuraPella"]
  productWithGlbFinish = ["ModMaxII","DuraPella"]


// To be added in Finish 

 if(currProduct && configuration.productWithOwnCollection.includes(currProduct.product_name)){
        const productMaterials = materials.filter((currMaterial:any)=> currMaterial.collection_name === currProduct?.product_name)
        materials = productMaterials
      }else{
        materials = materials.filter((currMaterial:any)=> !configuration.productWithOwnCollection.includes(currMaterial.collection_name))
      }


//update in customize in 3d

export async function updateTextureFromTextureInfo(textureInfo: any) {
  if (configuration.productWithGlbFinish.includes(STORE.getCurrProductName())) {
    await sofa.updateGlbAsTexture(textureInfo)
    return "done"
  }



  //add in sofa.tsx

     updateGlbAsTexture(textureInfo:any){
        const materialName = textureInfo.material_code || textureInfo.materialCode
        const isBrownModule = materialName.includes("Brown")
        const modulesToBeAdded = []
        let productModules = getFilteredArray(applicationConfig?.data?.productModules,"product_id",configuration.product.productId)

        // in configuration modules list itiriate through all modules and add _Brown to the module name if the material is brown and remove _Brown if the material is not brown and update the module name in configuration
        for (const currModule of configuration.modules) {
            if(isBrownModule){
                const newModule = configuration.currProductModulesList.find(m => m.module_name === `${currModule.moduleName}_Brown`)
                if(newModule){
                    modulesToBeAdded.push(newModule)
                }
                configuration.isBrownMaterial = true
            }else{
                const newModule = configuration.currProductModulesList.find(m => m.module_name === currModule.moduleName.replace("_Brown",""))
                if(newModule){
                    modulesToBeAdded.push(newModule)
                }
                configuration.isBrownMaterial = false
            }
        }

        if(applicationConfig.functions?.customizein3d?.resetCurrProductModulesList){
            applicationConfig.functions.customizein3d.resetCurrProductModulesList()
        }


        resetBoundingBox()
        resetGroupPositionRotation()
        return new Promise(async (resolve,reject)=>{
            try {
                resetConfiguration(false)
                await waitFor(200)
                for (let i = 0; i < modulesToBeAdded.length; i++) {
                    const module = modulesToBeAdded[i]
                    let isAddedAsAddon = false
                    await appendModel(module,isAddedAsAddon)
                    if(i === modulesToBeAdded.length - 1){
                        hideComponentLoader("loadConfigLoader")
                        resolve("Done")
                    }
                }
            } catch (error) {
                reject(error)
            }
        })

    }



    //add this in productmodulesandlayout 

      function resetCurrProductModulesList(){
    if(configuration.isBrownMaterial){
      setProductModulesList(configuration.currProductModulesList?.filter((module:any)=> module.module_name.includes("Brown")) || [])
    }else{
      setProductModulesList(configuration.currProductModulesList?.filter((module:any)=> !module.module_name.includes("Brown")) || [])
    }
  }

    useEffect(()=>{
    if(configuration.isLshapeWithSingleSeater){
      let result = ["Standalone","Layouts"]
      if(configuration.isAngledModules){
        result = ["Straight","Angled","Standalone","Layouts"]
        setIsShowAngledTab(true)
      }
      if(isShowAngledAsStraight){
        result = ["Angled","Standalone","Layouts"]
        setIsShowAngledTab(true)
      }
      if(applicationConfig.isBrandsure && STORE.getCurrSubCategory()?.includes("Shape")){
        result = ["Layouts"]
      }
      setTabItems(result)
      setCurrTab("Layouts")
    }
    applicationConfig.setFunctionRef("customizein3d",{resetCurrProductModulesList:resetCurrProductModulesList})
  },[])



//   Add this variable in configuration file 
  isBrownMaterial:boolean = false


  //Update this function in sofa.tsx

    async loadLayout(layout:any,isLoadingFromLayout:boolean = false){
        const modules = layout.modulesList
        resetBoundingBox()
        resetGroupPositionRotation()
        return new Promise(async (resolve,reject)=>{
            try {
                const isBrownMaterial = configuration.modules[0]?.moduleName?.includes("Brown")
                resetConfiguration(isLoadingFromLayout)
                configuration.layouts.currLayoutId = layout.id
                configuration.layouts.updateActiveClass()
                await waitFor(200)
                for (let i = 0; i < modules.length; i++) {
                    let module = modules[i]
                    if(isBrownMaterial){
                        module = configuration.currProductModulesList.find(m => m.module_name === `${module.module_name}_Brown`)
                    }
                    let isAddedAsAddon = false
                    await appendModel(module,isAddedAsAddon)
                    if(i === modules.length - 1){
                    applyFinishFromSavedConfig()
                    hideComponentLoader("loadConfigLoader")
                    resolve("Done")
                    }
                }
                logger?.info("customizein3d",`Layout loaded`)
            } catch (error) {
                logger?.info("customizein3d",`Error - Layout`)
                reject(error)
            }
        })
    }