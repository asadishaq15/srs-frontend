import axios from "axios"

export const uploadImageToAWS = async (file: File, setUploadProgress: (progress: number) => void): Promise<any> => {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_AWS_SERVER}/aws/signed-url?fileName=${file.name}&contentType=${file.type}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    ) 
    console.log('aws',response);
    const signedUrl = response.data.msg.url

    const uploadResponse = await axios.put(signedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      },
    })

    if (uploadResponse.status === 200) {
      return { awsUrl: signedUrl.split("?")[0], key: response.data.msg.key }
    } else {
      throw new Error("Failed to upload file")
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

export const deleteFromAWS = async (filename: string): Promise<void> => {
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_AWS_SERVER}/aws/${filename}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    console.log('delete aws', response)
    if (response) {
      return response.data
    } else {
      throw new Error("Failed to delete file")
    }
  } catch (error) {
    console.error("Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}
