import * as React from "react";
import { Box, Button, Divider, Grid, Typography, Link } from "@mui/material";

import { useInput } from "@/hooks/useInput";
import { useCelo } from "@celo/react-celo";
import { useEffect, useState } from "react";
import { SnackbarAction, SnackbarKey, useSnackbar } from "notistack";
import { truncateAddress } from "@/utils";
import { Gratitude } from "@local-contracts/types/Gratitude";

export function GratitudeContract({ contractData }) {
  const { kit, address, network, performActions } = useCelo();
  const [allPosts, setAllPosts] = useState([]);
  const [gratitudeInput, setgratitudeInput] = useInput({ type: "text" });
  const [contractLink, setContractLink] = useState<string>("");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const contract = contractData
    ? (new kit.connection.web3.eth.Contract(
        contractData.abi,
        contractData.address
      ) as any as Gratitude)
    : null;

  useEffect(() => {
    if (contractData) {
      setContractLink(`${network.explorer}/address/${contractData.address}`);
    }
  }, [network, contractData]);

  const gratefulFor = async () => {
    try {
      await performActions(async (kit) => {
        const gasLimit = await contract.methods
          .gratefulFor(gratitudeInput as string)
          .estimateGas();

        const result = await contract.methods
          .gratefulFor(gratitudeInput as string)
          //@ts-ignore
          .send({ from: address, gasLimit });

        console.log(result);

        const variant = result.status == true ? "success" : "error";
        const url = `${network.explorer}/tx/${result.transactionHash}`;
        const action: SnackbarAction = (key) => (
          <>
            <Link href={url} target="_blank">
              View in Explorer
            </Link>
            <Button
              onClick={() => {
                closeSnackbar(key);
              }}
            >
              X
            </Button>
          </>
        );
        enqueueSnackbar("Transaction processed", {
          variant,
          action,
        });
      });
    } catch (e) {
      enqueueSnackbar(e.message, { variant: "error" });
      console.log(e);
    }
  };

  const getAllPosts = async () => {
    try {
      setAllPosts([]);
      const result = await contract.methods.getAllPosts().call();
      setAllPosts((prevState) => [...prevState, ...result]);
      console.log(allPosts);
    } catch (e) {
      console.log(e);
    }
  };

  const getMyPosts = async () => {
    try {
      setAllPosts([]);
      const result = await contract.methods.getMyPosts().call();
      setAllPosts(result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Grid sx={{ m: 1 }} container justifyContent="center">
      <Grid item sm={6} xs={12} sx={{ m: 2 }}>
        <Typography variant="h2">Gratitude dAPP</Typography>
        <Typography variant="h6">
          Post what you are most grateful for!
        </Typography>
        <Divider sx={{ m: 1 }} />
        <Typography variant="h6">What are you most grateful for?</Typography>
        <Box sx={{ m: 1, marginLeft: 0 }}>{setgratitudeInput}</Box>
        <Button
          sx={{ m: 1, marginLeft: 0 }}
          variant="contained"
          onClick={gratefulFor}
        >
          Post
        </Button>
        <Divider sx={{ m: 1 }} />

        <Typography variant="h6">Posts</Typography>
        <Button
          sx={{ m: 1, marginLeft: 0 }}
          variant="contained"
          onClick={getAllPosts}
        >
          GET ALL POSTS
        </Button>
        <Button
          sx={{ m: 1, marginLeft: 0 }}
          variant="contained"
          onClick={getAllPosts}
        >
          GET MY POSTS
        </Button>

        <div>
          <ol>
            {allPosts &&
              allPosts.map((post, index) => {
                return (
                  <>
                    <li key={index}>{post}</li>
                  </>
                );
              })}
          </ol>
        </div>
      </Grid>
    </Grid>
  );
}
