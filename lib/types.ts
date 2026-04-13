/**
 * TypeScript interfaces for Zoho Creator API responses
 */

export interface ZohoLineItem {
  ID: string
  Line_Item_ref?: string
  last_item_ref?: string
  Discount?: string
  Discount1?: string
  UOM_Billing?: string
  Invoice_Dimension_Type?: string
  Selling_Price?: string
  Discount_Value?: string
  SQM?: string
  Invoice_Dimension_2?: string
  Invoice_Dimension_1?: string
  Qty?: string
  Total_Sale_Value?: string
  Gross_Amount?: string
  Total_Cost?: string
  Net_Selling_Amount?: string
  Conversion_per_SQM?: string
  Last_item_ref?: string
  Target_Price_UOM?: string
  Current_Purchase_Price_UOM?: string
  List_Price?: string
  Total_SQM?: string
  Pieces?: string
  zc_display_value?: string
  [key: string]: any
}

export interface AccountModule {
  ID: string
  zc_display_value?: string
  CRM_Account_ID?: string
}

export interface ZohoQuotation {
  ID: string
  Name?: string
  Created_Date_and_time?: string
  Quotation_Status?: string
  Method_of_Payment?: string
  Invoice_Account?: string
  Mode_of_Delivery?: string
  Delivery_Date_Control?: string
  Delivery_Terms?: string
  Term_of_Payment?: string
  Follow_up_Date?: string
  Due_Date?: string
  Sales_Required_Date?: string
  Customer_Required_Date?: string
  Customer_Reference_Date?: string
  customer_Reference?: string
  Customer_Zone?: string
  Currency?: string
  Remarks?: string
  Type_Of_Quotation?: string
  Template?: string
  Account_Module?: AccountModule
  Category_1_MM_Database_WI_2_0?: ZohoLineItem[]
  Category_1_MM_Database_WI?: Array<{
    ID: string
    Product_Group?: string
    Product_Name?: string
    Product_Code?: string
    Brand_Category?: string
    Supply_Form?: string
    Invoice_Form?: string
    Supply_Dimension_Type?: string
    Supply_Dimension_1?: string
    Supply_Dimension_2?: string
    Invoice_Dimension_Type?: string
    Invoice_Dimension_1?: string
    Invoice_Dimension_2?: string
    Conversion_Factor?: string
    Seam_Type?: string
    End_Type?: string
    Status?: string
    Product_Status?: string
    [key: string]: any
  }>
  Category_1_MM_Database_WMW_2_0?: ZohoLineItem[]
  Category_1_MM_Database_WMW?: Array<{
    ID: string
    Product_Group?: string
    Product_Name?: string
    Product_Master?: string
    Product_Code?: string
    Brand_Category?: string
    Brand_Selling_Name?: string
    Supply_Form?: string
    Invoice_Form?: string
    Supply_Dimension_Type?: string
    Supply_Dimension_1?: string
    Supply_Dimension_2?: string
    Invoice_Dimension_Type?: string
    Invoice_Dimension_1?: string
    Invoice_Dimension_2?: string
    Conversion_Factor?: string
    Seam_Type?: string
    End_Type?: string
    Status?: string
    Product_Status?: string
    Length_field?: string
    Width?: string
    Pieces?: string
    Qty?: string
    SQM?: string
    Total_SQM?: string
    Total_Price?: string
    List_Price?: string
    last_item_ref?: string
    [key: string]: any
  }>
  Category_2_MM_Database_WMW_2_0?: ZohoLineItem[]
  Category_2_MM_Database_WMW?: Array<{
    ID: string
    Product_Group?: string
    Product_Name?: string
    Product_Master?: string
    Product_Code?: string
    Brand_Category?: string
    Brand_Selling_Name?: string
    Supply_Form?: string
    Invoice_Form?: string
    Supply_Dimension_Type?: string
    Supply_Dimension_1?: string
    Supply_Dimension_2?: string
    Invoice_Dimension_Type?: string
    Invoice_Dimension_1?: string
    Invoice_Dimension_2?: string
    Conversion_Factor?: string
    Conversion_per_SQM?: string
    Seam_Type?: string
    End_Type?: string
    Status?: string
    Product_Status?: string
    Length_field?: string
    Width?: string
    Pieces?: string
    Qty?: string
    SQM?: string
    Total_SQM?: string
    Total_Price?: string
    List_Price?: string
    Price_Master_Name?: string
    Machine_ID?: string
    Last_item_ref?: string
    last_item_ref?: string
    Line_Item_ref?: string
    UOM_Billing?: string
    [key: string]: any
  }>
  Category_2_MM_Database_WI_2_0?: ZohoLineItem[]
  Category_2_MM_Database_WI?: Array<{
    ID: string
    Product_Group?: string
    Product_Name?: string
    Product_Code?: string
    Brand_Category?: string
    Supply_Form?: string
    Invoice_Form?: string
    Supply_Dimension_Type?: string
    Supply_Dimension_1?: string
    Supply_Dimension_2?: string
    Invoice_Dimension_Type?: string
    Invoice_Dimension_1?: string
    Invoice_Dimension_2?: string
    Conversion_Factor?: string
    Seam_Type?: string
    End_Type?: string
    Status?: string
    Product_Status?: string
    Line_Item_ref?: string
    [key: string]: any
  }>
  [key: string]: any
}

export type TemplateType = 'WI' | 'WMW' | 'WMW2' | 'EXPORT' | 'SLS' | 'GKD' | 'BVK' | 'DOOR_CORE'

/** Door Core (Core_Cover_page) BOQ line item from Zoho Quotation_Log_Door_Core */
export interface DoorCoreBOQItem {
  S_No1?: string | number
  Door_Ref?: string
  Door_Leaf_Width_mm?: string | number
  Door_Leaf_Height_mm?: string | number
  Leaf_Thick_mm?: string | number
  Door_Type?: string
  Product_Ref?: string
  Acoustic_Rating_db?: string | number
  Fire_Rating_mins?: string | number
  Vision_Panel_mm?: string | number
  Qty1?: string | number
  Unit_Price_AED1?: string | number
  Total_Unit_Price_AED1?: string | number
  [key: string]: any
}

/** Core_Cover_page record from Quotation_Log_Door_Core report */
export interface CoreCoverPageData {
  ID: string
  Quotation_No?: string
  Quotation_Submission_Date?: string
  Organization_Name1?: string
  Emirates?: string
  Project_Name?: string
  Project_Location?: string
  Subject_field?: string
  Customer_Name1?: string
  Scope_field?: string
  FR_Core?: string
  Acoustic_Core?: string
  Facing?: string
  Lipping?: string
  Finish?: string
  Intumescent_seals?: string
  Seal_Description?: string
  Acoustic_Seals?: string
  Division?: string
  Sub_Divisions?: string
  BOQ?: DoorCoreBOQItem[]
  Total_Amount_AED?: string | number
  VAT_5?: string | number
  Provision_for_Less_Special_Discount_AED?: string | number
  Grand_Total_AED?: string | number
  Payment_Terms1?: string
  Validity?: string
  Notes1?: string
  Sales_Person?: string
  /** Approval status: "Approved" | "Pending" — controls signature display with view param */
  Approval?: string
  Salesperson_Email?: string
  /** Principal / manufacturer name for footer “Exclusive distributors…” (Quotation_Log_Door_Core) */
  Trader_Name?: string
  Trader_Name1?: string
  [key: string]: any
}

export interface DoorCoreQuotationResponse {
  code: number
  data?: CoreCoverPageData[]
  error?: string
}

/** Quotation_Log_Door_Set_2: line item from Items_Details */
export interface QuotationLogDoorSet2Item {
  S_No1?: string | number
  Door_Ref?: string
  Product_Ref?: string
  Fire_Rating_Min?: string | number
  Acoustic_Rating_db?: string | number
  Door_Leaf_width_mm?: string | number
  Door_Leaf_Height_mm?: string | number
  Jamb_mm?: string | number
  Leaf_Thick_mm?: string | number
  Door_Type?: string
  Vision_Panel_MM?: string | number
  Hardware_Set?: string
  Unit1?: string
  Quantity1?: string | number
  Unit_Price1?: string | number
  Amount_AED?: string | number
  [key: string]: any
}

/** Quotation_Log_Door_Set_2: subform row (Section_1, Section_2, Section_3) */
export interface QuotationLogDoorSet2SubItem {
  S_No1?: string | number
  Description?: string
  Qty1?: string | number
  Unit_Price1?: string | number
  Total_Amount_AED?: string | number
  [key: string]: any
}

/** Quotation_Log_Door_Set_2 and Quotation_Door_Set1_Report record (shared form layout / API shape) */
export interface QuotationLogDoorSet2Data {
  ID: string
  Quotation_No?: string
  Quotation_Submission_Date?: string
  Organization_Name1?: string
  Emirates?: string
  Project_Name?: string
  Project_Location?: string
  Subject_field?: string
  Customer_Name1?: string
  Scope_field?: string
  FR_Core?: string
  Acoustic_Core?: string
  Facing?: string
  Lipping?: string
  Finish?: string
  Intumescent_seals?: string
  Seal_Description?: string
  Acoustic_Seals?: string
  Hardware?: string
  Seals_Require1?: string
  Division?: string
  Sub_Divisions?: string
  Items_Details?: QuotationLogDoorSet2Item[]
  Total_Quantity?: string | number
  Sub_Total?: string | number
  Section_1?: QuotationLogDoorSet2SubItem[]
  Section_2?: QuotationLogDoorSet2SubItem[]
  Section_3?: QuotationLogDoorSet2SubItem[]
  SubForm_Header?: string
  SubForm_Header1?: string
  Subform_Header2?: string
  Sub_Total1?: string | number
  Sub_Total2?: string | number
  Sub_Total3?: string | number
  Total_Amount_AED?: string | number
  Provision_for_Less_Special_Discount_AED?: string | number
  VAT_5_AED?: string | number
  Grand_Total_AED?: string | number
  Payment_Terms1?: string
  Validity?: string
  Notes1?: string
  Sales_Person?: string
  /** When "Approved", signature can be shown when view=approved in URL */
  SalesPerson_Approval_Status?: string
  Salesperson_Email?: string
  /** Legacy field name (same as SalesPerson_Approval_Status) */
  Approval?: string
  /** Principal / manufacturer name for footer “Exclusive distributors…” and signature “For …” (Door Set 1 & 2 reports) */
  Trader_Name?: string
  Trader_Name1?: string
  [key: string]: any
}

export interface QuotationLogDoorSet2Response {
  code: number
  data?: QuotationLogDoorSet2Data[]
  error?: string
}

/** Quotation_Log_Fitout_2: line item (Items_Details) – main form uses Unit */
export interface QuotationLogFitout2Item {
  S_No1?: string | number
  Unit?: string
  Item_Description?: string
  Quantity1?: string | number
  Unit_Price?: string | number
  Amount_AED1?: string | number
  [key: string]: any
}

/** Quotation_Log_Fitout_2: line item (Items_Details1) – subform uses Unit1 */
export interface QuotationLogFitout2Item1 {
  S_No1?: string | number
  Unit1?: string
  Item_Description?: string
  Quantity1?: string | number
  Unit_Price1?: string | number
  Amount_AED?: string | number
  [key: string]: any
}

/** Quotation_Log_Fitout_2: subform row (SubForm1, SubForm2) – subform uses Unit1 */
export interface QuotationLogFitout2SubItem {
  S_No1?: string | number
  Unit1?: string
  Item_Description?: string
  Qty1?: string | number
  Unit_Price1?: string | number
  Amount_AED?: string | number
  [key: string]: any
}

/** Quotation_Log_Fitout_2 report record (idealfitout app) */
export interface QuotationLogFitout2Data {
  ID: string
  Division?: string
  Sub_Divisions?: string
  Quotation_No?: string
  Quotation_Submission_Date?: string
  Organization_Name1?: string
  Emirates?: string
  Project?: string
  Project_Name?: string
  Project_Location?: string
  Subject_field?: string
  Customer_Name1?: string
  Subform_Header?: string
  Items_Details?: QuotationLogFitout2Item[]
  Sub_Total?: string | number
  Subform_Header1?: string
  Items_Details1?: QuotationLogFitout2Item1[]
  Sub_Total1?: string | number
  Subform_Header2?: string
  SubForm1?: QuotationLogFitout2SubItem[]
  Sub_Total2?: string | number
  Subform_Header3?: string
  SubForm2?: QuotationLogFitout2SubItem[]
  Sub_Total3?: string | number
  Total_Amount_AED1?: string | number
  Provision_for_Less_Special_Discount_AED?: string | number
  Total_amount_after_discount_AED?: string | number
  VAT_5?: string | number
  Grand_Total_AED1?: string | number
  Payment_Terms?: string
  Validity?: string
  Notes?: string
  Notes1?: string
  Sales_Person?: string
  [key: string]: any
}

export interface QuotationLogFitout2Response {
  code: number
  data?: QuotationLogFitout2Data[]
  response?: { result?: { rows?: unknown[] } }
  result?: { rows?: unknown[] }
  error?: string
}

export interface ShippingMaster {
  ID: string
  [key: string]: any
}

export interface BillingMaster {
  ID: string
  [key: string]: any
}

export interface ShippingMasterResponse {
  code: number
  data?: ShippingMaster[]
  error?: string
}

export interface BillingMasterResponse {
  code: number
  data?: BillingMaster[]
  error?: string
}

export interface ZohoQuotationResponse {
  code: number
  data?: ZohoQuotation[]
  error?: string
}

/**
 * Transformed quotation data for display
 */
export interface QuotationData {
  quotationNumber: string
  date: string
  buyerEnquiryNo: string
  termsOfPayment: string
  incoTerms: string
  termsOfDelivery: string
  deliveryDate: string
  followUpDate: string
  dueDate: string
  customerReference: string
  customerReferenceDate: string
  currency: string
  remarks: string
  lineItems: QuotationLineItem[]
  totalAmount: number
}

export interface QuotationLineItem {
  product: string
  quality: string
  form: string
  size: string
  type: string
  delivery: string
  uom: string
  qty: string
  subQty: string
  unit: string
  pieces?: string
  rate: string
  amount: string
}
