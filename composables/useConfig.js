const voronoiIteration = ref(5)

const useConfig = () => {
  return {
    height: 800,
    width: 800,
    margin: 0,
    nbPoints: 200,
    voronoiIteration,
    waterIteration: 1,
    nbBays: 2,
  }
}
export default useConfig